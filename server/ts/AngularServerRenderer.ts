/**
 * Created by antoine on 07/07/16.
 */

import cacheEngine from './CacheEngine';

import * as Q from 'q';
import * as jsdom from 'jsdom';
import {Config} from './EngineConfig';
import * as dbug from 'debug';
var debug = dbug('angular.js-server');


class AngularServerRenderer {

    private cache;

    constructor(private config: Config) {
        this.cache = new cacheEngine(this.config);
    }


    private shouldRender(url: string) {
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

    private getHTML (window: any, timeouts: any) {
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
                    }).fail(function(err) {
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

    public render = (html: string, url: string) => {

        var defer = Q.defer();

        if (this.shouldRender(url) === false) {
            debug('This Angular URL should not be pre-rendered', url);
            defer.resolve( html );
        } else {
            let cacheUrl = this.cache.loadUrl(html, url);
            if (cacheUrl.isCached()) {
                debug('This URL is cached', url);
                defer.resolve(cacheUrl.getCached());
            } else {

                jsdom.debugMode = true;

                let rendering = false;

                console.log('SERVER URL = ', 'http://' + this.config.server.domain + ':' + this.config.server.port + url);

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

                let window = (<any>Object).assign(document.defaultView, { onServer: true});

                window.addEventListener('angularInConfig', function() {
                    debug('EVENT angularInConfig CAUGHT');
                    afterAngularStarted();
                });

                console.log('jsdom.jsdom loaded');

                let serverTimeout = setTimeout( () => {
                    if (rendering) return;
                    debug('SERVER TIMEOUT ! ! !');
                    //@todo Get the error URl here
                    rendering = true;
                    let renderedHtml = this.getHTML(window, [serverTimeout]);
                    cacheUrl.removeCache();
                    defer.resolve(renderedHtml);
                    window.close();
                }, this.config.server.timeout);

/*
                window.addEventListener('error', function (err) {
                    rendering = true;
                    cacheUrl.removeCache();
                    debug('EVENT LISTENER ON ERROR CATCHED', err);
                    defer.reject(err);
                    window.close();
                    window.dispose();
                });
*/
                window.addEventListener('StackQueueEmpty',  () => {
                    debug('StackQueueEmpty event caught');
                    if (rendering) return;
                    rendering = true;
                    let renderedHtml = this.getHTML(window, [serverTimeout]);
                    cacheUrl.cacheIt(renderedHtml);
                    defer.resolve(renderedHtml);
                    window.close();
                    window.dispose();
                });


                window.addEventListener('load', () => {
                    debug('Application is loaded in JSDOM');
                });

                var afterAngularStarted = () => {
                    let windowApp = window[this.config.name];
                    windowApp.config(function($provide) {
                        $provide.decorator('$exceptionHandler', function($exceptionHandler) {
                            return function(error, cause) {
                                debug('Throwing error = ', error);
                                debug('cause', cause);
                                $exceptionHandler(error, cause);
                                throw error;
                            };
                        });
                    });
                };
            }
        }

        return defer.promise;
    };

};

module.exports = AngularServerRenderer;
