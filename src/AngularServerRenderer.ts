import * as jsdom from 'jsdom';
import {IGeneralConfig, IResponse} from './interfaces';
import EngineConfig from './EngineConfig';
import * as dbug from 'debug';
import * as fs from 'fs';
import {Promise} from 'es6-promise';
import * as sourceMapSupport from 'source-map-support'
import {Response, ResponseStatus} from './ResponseFormater';
import * as requesting from 'request';
import  * as events from 'events';
import * as uuid from 'node-uuid';
import Helpers from './Helpers';

sourceMapSupport.install({
    handleUncaughtExceptions: false
});

//import * as stacktrace from 'stack-trace';
/*sourceMapSupport.install({
    retrieveSourceMap: (source) => {
        if (source === 'AngularServerRenderer.js') {
            return {
                url: 'AngularServerRendererMap.js',
                map: fs.readFileSync('AngularServerRenderer.js.map', 'utf8')
            };
        }
        return null;
    }
});*/


var debug = dbug('angular.js-server');

class JSDOMEventEmitter extends events.EventEmitter {}

const JSDOM_EVENTS = {
    JSDOM_ERROR: 'JSDOM_ERROR',
    JSDOM_URL_ERROR: 'JSDOM_URL_ERROR',
    JSDOM_CREATED_ERROR: 'JSDOM_CREATED_ERROR',
    JSDOM_DONE_ERROR: 'JSDOM_DONE_ERROR'
};

class AngularServerRenderer {

    public config: EngineConfig;

    private externalResources = [];

    private static eventEmmiter: JSDOMEventEmitter = new JSDOMEventEmitter();

    constructor(config?: IGeneralConfig) {
        this.config = new EngineConfig(config);
        debug('AngularServerRenderer initialized with config = ', config);
    }

    addExternalresource = (url: string | RegExp, content: string) => {
        Helpers.CheckType(url, ['string', 'regexp']);
        Helpers.CheckType(content, 'string');
        this.externalResources.push({
            url: url,
            content: content
        });
    };

    emptyExternalResources = () => {
        this.externalResources = [];
    };

    getExternalResources = () => {
        return this.externalResources;
    };

    private getHTML  = (window: any, timeouts: any): string => {
        debug('Getting HTML.');
        let AngularDocument = window.angular.element(window.document);

        let scope = AngularDocument.scope();

        scope.$apply();
        for (let i in timeouts) {
            clearTimeout( timeouts[i]);
        }

        let html = window.document.documentElement.outerHTML;

        if (typeof window.$cacheFactoryProvider !== 'undefined') {
            debug('$cacheFactoryProvider', window.$cacheFactoryProvider);

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
    
    middleware = () => {

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
                        return send.apply(this, [result.html]);
                    },function(result) {
                        debug('MidleWare error rendering');
                        res.status(500);
                        res.location(req.url);
                        return send.apply(this,[result.html]);
                    });
                } else {
                    return send.apply(this, [body]);
                }
            };

            next();
            
        };
    };

    private instanciateJSDOM = (html: string, url: string, uid: string): any => {
        jsdom.debugMode = true;
        const URL = this.config.server.getDomain() + ':' + this.config.server.getPort() + url
        debug('SERVER URL = ', URL);

        const debugVirtualConsole = jsdom.createVirtualConsole();
        debugVirtualConsole.on("jsdomError",  (error) => {
            AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_ERROR + uid, error);
            debug('Some serious shit happened',  error.detail);
        });

        let document  = jsdom.jsdom(html, {
            features: {
                FetchExternalResources: ['script'],
                ProcessExternalResources: ['script']
            },
            resourceLoader:  (resource, callback: Function) => {
                let pathname = resource.url.pathname;
                let externalResource;
                for(var i in this.externalResources) {
                    externalResource = this.externalResources[i];
                    debug('Checking ', pathname, 'with ', externalResource.url);
                    if ( (typeof externalResource.url === 'string' && pathname === externalResource.url) || (typeof externalResource.url === 'regexp' && externalResource.url.test(pathname))) {
                        return callback(null, externalResource.content);
                    }
                }
                let fixedURL = null;
                debug('loading external resource  ', resource.url.pathname);
                //because of issue https://github.com/tmpvar/jsdom/issues/156

                if ( resource.url.href.indexOf(this.config.server.getDomain() + ':' + this.config.server.getPort()) === 0) {
                    //we probably are loading from same domain a relative url
                    if (/^(.+)\/.+/.test(url)) {
                        let regexResult = /^(.+)\/.+/.exec(url);
                        const fragment = regexResult[1];
                        if( resource.url.pathname.indexOf(fragment) === 0) {
                            //probably the bug isnt fixed yet, there is a work around
                            fixedURL = this.config.server.getDomain() + ':' + this.config.server.getPort() + resource.url.pathname.substr(fragment.length);
                            debug('Url fixed to ', fixedURL);
                        }
                    }
                }
                if (fixedURL === null) {
                    fixedURL = resource.url.href;
                    //return resource.defaultFetch(callback);
                }
                requesting(fixedURL, (err, response, body) => {
                    if(err) {
                        //debug("Error fetching the url ", fixedURL, err);
                        AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, err);
                        return;
                    }
                    if(response.statusCode !== 200) {
                        //debug("Error fetching ther url", fixedURL, response);
                        AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, response);
                        return;
                    }
                    return callback(null, body);
                });
            },
            url: URL,
            virtualConsole: this.config.server.getDebug() ? debugVirtualConsole.sendTo(console, { omitJsdomErrors: true }) : debugVirtualConsole,
            document: {
                referrer: '',
                cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
                cookieDomain: this.config.server.getDomain()
            },
            created: (error, window) => {
                if(error) {
                    debug('Created event caught', error);
                    AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid, error);
                }
            },
            done: (error, window) => {
                if(error) {
                    debug('Done event caught', error);
                    AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_DONE_ERROR  +  uid, error);
                }
            }
        });

        return (<any>Object).assign(document.defaultView, {
            onServer: true,
            fs: fs,
            logConfig: this.config.log.getConfig(),
            serverDebug: this.config.server.getDebug(),
            clientTimeoutValue: 100
        });

    };

    private clearEventEmitterListeners = (uid: string) => {
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_ERROR + uid);
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid);
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_DONE_ERROR + uid);
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_URL_ERROR + uid);
    };

    render = (html: string, url: string): Promise<IResponse> => {
        Helpers.CheckType(url, 'string');
        Helpers.CheckType(html, 'string');

        return new Promise((resolve, reject) =>{
            let shouldRender;

            shouldRender = this.config.render.shouldRender(url);
        
            if (!shouldRender) {

                debug('This Angular URL should not be pre-rendered', url);
                resolve( Response.send(html, ResponseStatus.RENDER_EXCLUDED));

            } else {
                let cacheUrl = this.config.cache.getCacheEngine().url(url);
                cacheUrl.isCached().then((isCached) =>{
                    debug('Is URL ', url, 'cached?', isCached);

                    if (isCached === true) {
                        debug('This URL is cached', url);
                        cacheUrl.getUrl().then((res) => {
                            resolve( Response.send(res, ResponseStatus.ALREADY_CACHED));
                        });
                    } else {

                        let rendering = false;

                        let uid = uuid.v1();

                        AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_ERROR + uid, (error) => {
                            debug('Some JSDOM exception happened', error);
                            this.clearEventEmitterListeners(uid);
                            reject(Response.send(html, ResponseStatus.JSDOM_ERROR, error));
                        });

                        AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid, (error) => {
                            this.clearEventEmitterListeners(uid);
                            reject(Response.send(html, ResponseStatus.JSDOM_ERROR, error));
                        });

                        AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_DONE_ERROR + uid, (error) => {
                            this.clearEventEmitterListeners(uid);
                            reject(Response.send(html, ResponseStatus.JSDOM_ERROR, error));
                        });

                        AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, (error) => {
                            this.clearEventEmitterListeners(uid);
                            reject(Response.send(html, ResponseStatus.JSDOM_URL_ERROR, error));
                        });

                        const window = this.instanciateJSDOM(html, url, uid);

                        let serverTimeout = setTimeout( () => {
                            if (rendering) return;
                            debug('SERVER TIMEOUT ! ! !');
                            //@todo Get the error URl here
                            rendering = true;
                            //let renderedHtml = this.getHTML(window, [serverTimeout]);
                            //TODO: log the error
                            //TODO: send a different header
                            this.clearEventEmitterListeners(uid);
                            cacheUrl.removeUrl().then((res) => {
                                debug('Remove URL', res);
                                reject(Response.send(html, ResponseStatus.SERVER_TIMEOUT));
                                window.close();
                            }, (res) =>{
                                reject(Response.send(html, ResponseStatus.SERVER_TIMEOUT));
                                window.close();
                            });
                        }, this.config.server.getTimeout());

                        window.addEventListener('ServerExceptionHandler',  (err, data) => {
                            rendering = true;
                            this.clearEventEmitterListeners(uid);
                            cacheUrl.removeUrl().then(() => {
                                debug('EVENT LISTENER ON ServerExceptionHandler CATCHED', err.details);
                                reject(Response.send(html, ResponseStatus.ERROR_HANDLER, err));
                                window.close();
                                window.dispose();
                            });
                        });

                        window.addEventListener('Idle',  () => {
                            debug('Idle event caught');
                            if (rendering) return;
                            rendering = true;
                            let renderedHtml = this.getHTML(window, [serverTimeout]);
                            this.clearEventEmitterListeners(uid);
                            cacheUrl.cache(renderedHtml).then((cacheStatus) => {
                                debug('caching the url = ', url,  cacheStatus);
                                resolve(Response.send(renderedHtml, ResponseStatus.RENDERED));
                                window.close();
                                window.dispose();
                            }, function(err) {
                                debug('Something went wrong with the cache', err);
                                resolve(Response.send(renderedHtml, ResponseStatus.RENDERED));
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