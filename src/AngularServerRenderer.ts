/**
 * Created by antoine on 07/07/16.
 */

import * as jsdom from 'jsdom';
import {Config} from './EngineConfig';
import * as dbug from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
//import * as stacktrace from 'stack-trace';
import {CacheEngine} from 'simple-url-cache';
import * as sourceMapSupport from 'source-map-support'

sourceMapSupport.install({
    retrieveSourceMap: (source) => {
        if (source === 'AngularServerRenderer.js') {
            return {
                url: 'AngularServerRendererMap.js',
                map: fs.readFileSync('AngularServerRenderer.js.map', 'utf8')
            };
        }
        return null;
    }
});

var debug = dbug('angular.js-server');

declare module 'shelljs' {
    export function touch( paths: string[]);
}

class AngularServerRenderer {

    private cache: CacheEngine;

    constructor(private config: Config) {
        debug('AngularServerRenderer initialized with config = ', this.config);
        this.cache = new CacheEngine(this.config.cache.storageConfig, this.config.cache.cacheRules);
        this.initiateLogFileStructure();
    }

    private initiateLogFileStructure(): void {
        this.config.log.dir = path.resolve(this.config.log.dir);
        shell.mkdir('-p',this.config.log.dir);
        const paths = [];
        ['warn', 'log', 'debug', 'error', 'info'].forEach((item)=> {
            if( this.config.log[item].enabled ) {
                paths.push( path.resolve(path.join( this.config.log.dir, item )));
            }
        });
        shell.touch(paths);
    }

    private shouldRender(url: string): boolean {
        let i,regex;
        switch (this.config.render.strategy) {
            case 'none':
                return false;
            case 'all':
                return true;
            case 'include':
                for (i in this.config.render.rules) {
                    regex = this.config.render.rules[i];
                    if(regex.test(url)) {
                        return true;
                    }
                }
                return false;
            case 'exclude':
                for (i in this.config.render.rules) {
                    regex = this.config.render.rules[i];
                    if(regex.test(url)) {
                        return false;
                    }
                }
                return true;
        }
    };

    private getHTML (window: any, timeouts: any): string {
        debug('Getting HTML.');
        let AngularDocument = window.angular.element(window.document);

        let scope = AngularDocument.scope();

        scope.$apply();
        for (let i in timeouts) {
            clearTimeout( timeouts[i]);
        }

        let html = window.document.documentElement.outerHTML;

        debug('$cacheFactoryProvider', window.$cacheFactoryProvider);

        if (typeof window.$cacheFactoryProvider !== 'undefined') {
            let cachedData = window.$cacheFactoryProvider.exportAll();

            let script = "<script type='text/javascript'> " +
                "/*No read only needed */" +
                "/*Object.defineProperty (window,'$angularServerCache', {value :  " + JSON.stringify(cachedData)  + ",writable: false});*/"
                + "window.$angularServerCache = " + JSON.stringify(cachedData) + ";</script></head>";
            debug('inserting the script: ',script);
            html = html.replace(/<\/head>/i, script);
        }

        debug('returned HTML length: ', html.length);
        return html;
    };
    
    public middleware = () => {

        var self = this;
        return (req, res, next) => {
            debug('MiddleWare called with URL ', req.url);

            if (req.method !== 'GET') {
                next();
            }
            if (req.xhr === true) {
                next();
            }
            if( /text\/html/.test(req.get('accept')) !== true) {
                next();
            }

            var send = res.send.bind(res);

            res.send = function (body) {
                if(typeof body === 'string') {
                    self.render(body, req.url).then(function(result) {
                        debug('MiddleWare successfully rendered');
                        res.location(req.url);
                        res.status(200);
                        return send.apply(this, [result]);
                    }).catch(function(err) {
                        debug('MidleWare error rendering');
                        res.status(500);
                        res.location(req.url);
                        return send.apply(this,[err]);
                    });
                } else {
                    return send.apply(this, [body]);
                }
            };

            next();
            
        };
    };

    public render = (html: string, url: string): Promise<string> => {

        return new Promise((resolve, reject) =>{
            if (this.shouldRender(url) === false) {
                debug('This Angular URL should not be pre-rendered', url);
                resolve( html );
            } else {
                let cacheUrl = this.cache.url(url);
                cacheUrl.isCached().then((isCached) =>{
                    if (isCached === true) {
                        debug('This URL is cached', url);
                        cacheUrl.getUrl().then((res) => {
                            resolve(res);
                        });
                    } else {

                        jsdom.debugMode = true;

                        let rendering = false;

                        debug('SERVER URL = ', 'http://' + this.config.server.domain + ':' + this.config.server.port + url);

                        let document  = jsdom.jsdom(html, {
                            features: {
                                FetchExternalResources: ['script'],
                                ProcessExternalResources: ['script']
                            },
                            url: 'http://' + this.config.server.domain + ':' + this.config.server.port + url,
                            virtualConsole: jsdom.createVirtualConsole().sendTo(console),
                            document: {
                                referrer: '',
                                cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
                                cookieDomain: this.config.server.domain
                            }
                        });

                        let window = (<any>Object).assign(document.defaultView, {
                            onServer: true,
                            fs: fs,
                            logConfig: this.config.log
                        });

                        debug('jsdom.jsdom loaded');

                        let serverTimeout = setTimeout( () => {
                            if (rendering) return;
                            debug('SERVER TIMEOUT ! ! !');
                            //@todo Get the error URl here
                            rendering = true;
                            let renderedHtml = this.getHTML(window, [serverTimeout]);
                            cacheUrl.removeUrl().then(() => {
                                resolve(renderedHtml);
                                window.close();
                            });
                        }, this.config.server.timeout);

                        window.addEventListener('ServerExceptionHandler',  (err, data) => {
                            rendering = true;
                            cacheUrl.removeUrl().then(() => {
                                debug('EVENT LISTENER ON ServerExceptionHandler CATCHED', err.details);
                                reject(err.details);
                                window.close();
                                window.dispose();
                            });
                        });

                        window.addEventListener('StackQueueEmpty',  () => {
                            debug('StackQueueEmpty event caught');
                            if (rendering) return;
                            rendering = true;
                            let renderedHtml = this.getHTML(window, [serverTimeout]);
                            cacheUrl.cache(renderedHtml).then(() => {
                                resolve(renderedHtml);
                                window.close();
                                window.dispose();
                            });

                        });

                        window.addEventListener('load', () => {
                            debug('Application is loaded in JSDOM');
                        });

                    }
                });

            }

        });
    };

};

module.exports = AngularServerRenderer;
