import * as jsdom from 'jsdom';
import {IGeneralConfig, NGResponseCodes, INGResponse, JSDOM_EVENTS} from './interfaces';
import EngineConfig from './EngineConfig';
import * as dbug from 'debug';
import * as fs from 'fs';
import * as sourceMapSupport from 'source-map-support'
import * as requesting from 'request';
import * as events from 'events';
import * as uuid from 'node-uuid';
import Helpers from './Helpers';
import http = require("http");
import {Request, Response} from "express-serve-static-core";
import {CallBackBooleanParam} from "redis-url-cache/index";

sourceMapSupport.install({
    handleUncaughtExceptions: false
});

var debug = dbug('angular.js-server');

class JSDOMEventEmitter extends events.EventEmitter {}

class AngularServerRenderer {

    public config:EngineConfig;

    private static eventEmmiter:JSDOMEventEmitter = new JSDOMEventEmitter();

    constructor(config: IGeneralConfig, cb: Function) {
        this.config = new EngineConfig(config, (err) => {
            if (err) throw err;
            cb(null);
        });

        debug('AngularServerRenderer initialized with config = ', config);
    }

    /**
     * Preload JS content into file names, instead of querying external files, JSDOM will use the @param content provided.
     * Helps a lot when loading external script served with a slow connection. Increases performances a lot.
     *
     **/
    addExternalResource = (url:string, content:string, cb: CallBackBooleanParam): void => {
        debug('Adding external resource ', url);
        this.config.jsdomCache.url(url).set(content, false, cb);
    };

    emptyExternalResources(cb: CallBackBooleanParam) : void{
        this.config.jsdomCache.clearInstance( cb );
    };

    getExternalResources (cb): void {
        var urls = [];
        let nb = 0;
        debug('getting external resources');
        this.config.jsdomCache.getStoredHostnames( (err, domains) => {
            if(err) return cb(err);
            domains.forEach( domain => {
                this.config.jsdomCache.getStoredURLs(domain, (err, res) => {
                    if(err) return cb(err);
                    urls[domain] = res;
                    if(++nb === domains.length) {
                        cb(null, urls);
                    }
                })
            });
        });
    };

    middleware = (req: Request, res: Response, next: Function) => {
        debug('MiddleWare called with URL ', req.url);


        if (req.method !== 'GET') {
            next();
        }
        if (req.xhr === true) {
            next();
        }
        if (/text\/html/.test(req.get('accept')) !== true) {
            next();
        }

        var send = res.send.bind(res);

        res.send = (body) => {
            if (typeof body === 'string') {
                this.render(body, req.url, (err, result)=>{
                    if(err) {
                        debug('MidleWare error rendering', result.status);
                        res.status(500);
                        res.location(req.url);
                        return send.apply(this, [err.html]);
                    }
                    debug('MiddleWare successfully rendered', result.status);
                    res.location(req.url);
                    res.status(200);
                    return send.apply(this, [result.html]);
                });
            } else {
                return send.apply(this, [body]);
            }
        };
        next();
    };


    render = (html:string, url:string, cb: Function): void => {
        Helpers.CheckType(url, 'string');
        Helpers.CheckType(html, 'string');

        const shouldRender = this.config.render.shouldRender(url);
        debug('Should render?', url, shouldRender);

        if (!shouldRender) {
            debug('This Angular URL should not be pre-rendered', url);
            return cb(this.send(null, html, NGResponseCodes.RENDER_EXCLUDED));
        } else {
            let cacheUrl = this.config.cache.url(url);
            cacheUrl.has( (err, isCached) => {
                if(err) return cb(this.send(null, html, NGResponseCodes.CACHE_ENGINE_ERROR, err));

                debug('Is URL ', url, 'cached?', isCached);

                if (isCached === true) {
                    debug('This URL is cached', url);
                    cacheUrl.get( (err, res) => {
                        if(err) return cb(this.send(null, html, NGResponseCodes.CACHE_ENGINE_ERROR, err));
                        return cb(null, this.send(null, res, NGResponseCodes.ALREADY_CACHED));
                    });
                } else {


                    let rendering = false;

                    let uid = uuid.v1();

                    AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_ERROR + uid, (error) => {
                        debug('Some JSDOM exception happened', error);
                        this.clearEventEmitterListeners(uid);
                        cb(this.send(window, html, NGResponseCodes.JSDOM_ERROR, error));
                    });

                    AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid, (error) => {
                        this.clearEventEmitterListeners(uid);
                        cb(this.send(window, html, NGResponseCodes.JSDOM_ERROR, error));
                    });

                    AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_DONE_ERROR + uid, (error) => {
                        this.clearEventEmitterListeners(uid);
                        cb(this.send(window, html, NGResponseCodes.JSDOM_ERROR, error));
                    });

                    AngularServerRenderer.eventEmmiter.on(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, (error) => {
                        this.clearEventEmitterListeners(uid);
                        cb(this.send(window, html, NGResponseCodes.JSDOM_URL_ERROR, error));
                    });

                    this.instanciateJSDOM(html, url, uid, (err, win) => {
                        const window = win;
                        if(err) return cb(this.send(window, html, NGResponseCodes.JSDOM_ERROR, err));

                        let serverTimeout = setTimeout(() => {
                            if (rendering) return;
                            debug('SERVER TIMEOUT ! ! !');
                            //@todo Get the error URl here
                            rendering = true;
                            //let renderedHtml = this.getHTML(window, [serverTimeout]);
                            //TODO: log the error
                            //TODO: send a different header
                            this.clearEventEmitterListeners(uid);
                            cacheUrl.delete( (err, res) => {
                                if(err) cb(this.send(window, html, NGResponseCodes.CACHE_ENGINE_ERROR, err));

                                cb(this.send(window, html, NGResponseCodes.SERVER_TIMEOUT));
                                debug('window.close() called');
                                return;
                            });
                        }, this.config.server.getTimeout());

                        window.addEventListener('ServerExceptionHandler', (err, data) => {
                            rendering = true;
                            this.clearEventEmitterListeners(uid);
                            cacheUrl.delete((err) => {
                                if (err) {
                                    debug('EVENT LISTENER ON ServerExceptionHandler CATCHED', err);
                                    return cb(this.send(window, html, NGResponseCodes.CACHE_ENGINE_ERROR, err));
                                }
                                cb(this.send(window, html, NGResponseCodes.ERROR_HANDLER, err));

                                return;
                            });
                        });

                        window.addEventListener('Idle', () => {
                            debug('Idle event caught');
                            if (rendering) return;
                            rendering = true;
                            let renderedHtml = this.getHTML(window, [serverTimeout]);
                            this.clearEventEmitterListeners(uid);
                            cacheUrl.set(renderedHtml, false, (err, cacheStatus) => {
                                if (err) return cb(this.send(window, html, NGResponseCodes.CACHE_ENGINE_ERROR, err));
                                debug('url is now cached', url, cacheStatus);
                                cb(this.send(window, renderedHtml, NGResponseCodes.RENDERED));

                                return;
                            });
                        });

                        window.addEventListener('load', () => {
                            debug('Application is loaded in JSDOM');
                        });
                    });
                }
            })
        }
    };

    private send = (window: Window, html: string, status: number, Exception?: Error | string): INGResponse => {

        if(typeof NGResponseCodes[status] === 'undefined') {
            throw new Error('This status doesn\'t exist ' + status);
        }

        let trace = null,
            errorMsg;
        if( Exception instanceof Error) {
            trace = Error['stack'];
            errorMsg = Exception.message;
        } else {
            trace = new Error().stack;
            errorMsg = Exception;
        }
        if(window) {
            debug('closing window');
            window.close();
            window.dispose();
        } else {
            debug('Window is not set: ', window);
        }
        return {
            html: html,
            code: status,
            status: NGResponseCodes[status],
            errorMsg: errorMsg,
            stacktrace: trace
        };

    };

    private $restCache(url: string, timeout: number) {}

    private clearEventEmitterListeners = (uid:string) => {
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_ERROR + uid);
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid);
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_DONE_ERROR + uid);
        AngularServerRenderer.eventEmmiter.removeAllListeners(JSDOM_EVENTS.JSDOM_URL_ERROR + uid);
    };

    private getHTML = (window:any, timeouts:any):string => {
        debug('Getting HTML.');
        let AngularDocument = window.angular.element(window.document);

        let scope = AngularDocument.scope();

        scope.$apply();
        for (let i in timeouts) {
            clearTimeout(timeouts[i]);
        }

        let html = window.document.documentElement.outerHTML;

        if (typeof window.$cacheFactoryProvider !== 'undefined') {
            debug('$cacheFactoryProvider', window.$cacheFactoryProvider);

            let cachedData = window.$cacheFactoryProvider.exportAll();

            let script = "<script type='text/javascript'> " +
                "/*No read only needed */" +
                "/*Object.defineProperty (window,'$angularServerCache', {value :  " + JSON.stringify(cachedData) + ",writable: false});*/"
                + "window.$angularServerCache = " + JSON.stringify(cachedData) + ";</script></head>";
            debug('inserting the script: ', script);
            html = html.replace(/<\/head>/i, script);
        }

        debug('returned HTML length: ', html.length);
        return html;
    };

    private jsDOMRequestUrl(uid: string, externalResources: string[][], resource, callback) {
        let fixedURL = null,
            pathname = resource.url.pathname,
            url = resource.url.href;

        debug('loading external resource  ', resource.url.pathname);
        //because of issue https://github.com/tmpvar/jsdom/issues/156

        /*if (url.indexOf(this.config.server.getDomain()) === 0) {
            //we probably are loading from same domain a relative url
            if (/^(.+)\/.+/.test(pathname)) {
                let regexResult = /^(.+)\/.+/.exec(pathname);
                const fragment = regexResult[1];
                if (resource.url.pathname.indexOf(fragment) === 0) {
                    //probably the bug isnt fixed yet, there is a work around
                    fixedURL = this.config.server.getDomain() + resource.url.pathname.substr(fragment.length);
                    debug('Url fixed to ', fixedURL);
                }
            }
        }*/
        if (fixedURL === null) {
            fixedURL = resource.url.href;
            //return resource.defaultFetch(callback);
        }
        requesting(fixedURL, (err, response, body) => {
            if (err) {
                debug("Error fetching the url ", fixedURL, err);
                AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, err);
                return;
            }
            if (response.statusCode !== 200) {
                debug("Error fetching ther url", fixedURL, response);
                AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, response);
                return;
            }
            return callback(null, body);
        });
    };
    /*
    private jsDOMRequestUrl2(uid: string, externalResources: string[][], resource, callback) {
        let pathname = resource.url.pathname,
            url = resource.url.href;

        externalResources.forEach((storedUrls, domain) => {

            var found = false;
            storedUrls.forEach(storedUrl => {
                debug('Checkinggggg ', pathname, 'with ', domain, url);
                if( (domain + storedUrl) === url) {
                    found = true;
                    this.config.jsdomCache.url(domain+url).get( (err, content) => {
                        if (err) {
                            AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, err);
                            return;
                        }
                        return callback(null, content);
                    });
                }
            });
            if (!found) {
                let fixedURL = null;

                debug('loading external resource  ', resource.url.pathname);
                //because of issue https://github.com/tmpvar/jsdom/issues/156

                if (url.indexOf(this.config.server.getDomain()) === 0) {
                    //we probably are loading from same domain a relative url
                    if (/^(.+)\/.+/.test(pathname)) {
                        let regexResult = /^(.+)\/.+/.exec(pathname);
                        const fragment = regexResult[1];
                        if (resource.url.pathname.indexOf(fragment) === 0) {
                            //probably the bug isnt fixed yet, there is a work around
                            fixedURL = this.config.server.getDomain() + resource.url.pathname.substr(fragment.length);
                            debug('Url fixed to ', fixedURL);
                        }
                    }
                }
                if (fixedURL === null) {
                    fixedURL = resource.url.href;
                    //return resource.defaultFetch(callback);
                }
                requesting(fixedURL, (err, response, body) => {
                    if (err) {
                        //debug("Error fetching the url ", fixedURL, err);
                        AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, err);
                        return;
                    }
                    if (response.statusCode !== 200) {
                        //debug("Error fetching ther url", fixedURL, response);
                        AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_URL_ERROR + uid, response);
                        return;
                    }
                    return callback(null, body);
                });
            }
        });
    }*/

    /**
     * TODO parse url using nodeurl
     * @param html
     * @param url
     * @param uid
     * @returns {any}
     */
    private instanciateJSDOM(html:string, url:string, uid:string, cb: Function): void {
        jsdom.debugMode = true;
        const URL = this.config.server.getDomain() + url;
        debug('SERVER URL = ', URL);

        const debugVirtualConsole = jsdom.createVirtualConsole();
        debugVirtualConsole.on("jsdomError", (error) => {
            AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_ERROR + uid, error);
            debug('Some serious shit happened', error.detail);
        });

        let jsDomConsole;

        const jsDomConsoleConfig = this.config.server.getJSDomConsole();

        switch(jsDomConsoleConfig) {
            case 'none':
                jsDomConsole = debugVirtualConsole;
                break;
            case 'log':
                jsDomConsole = debugVirtualConsole.sendTo(console, {omitJsdomErrors: true});
                break;
            case 'all':
                jsDomConsole = debugVirtualConsole.sendTo(console)
                break;
        }

        /*this.getExternalResources( (err, data) => {
            if(err) return cb(err);

            let externalResources = [] ;
            for(let domain in data) {
                for( let j in data[domain]) {
                    externalResources.push( domain + data[domain][j] );
                }
            }*/

            let document = jsdom.jsdom(html, {
                features: {
                    FetchExternalResources: ['script'],
                    ProcessExternalResources: ['script']
                },
                resourceLoader: (resource, callback:Function) => {
                    return this.jsDOMRequestUrl(uid, [], resource, callback);
                },
                url: URL,
                virtualConsole: jsDomConsole,
                document: {
                    referrer: '',
                    cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
                    cookieDomain: this.config.server.getDomain()
                },
                created: (error, window) => {
                    if (error) {
                        debug('Created event caught', error);
                        AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid, error);
                    }
                },
                done: (error, window) => {
                    if (error) {
                        debug('Done event caught', error);
                        AngularServerRenderer.eventEmmiter.emit(JSDOM_EVENTS.JSDOM_DONE_ERROR + uid, error);
                    }
                }
            });

            cb(null, ((<any>Object).assign(document.defaultView, {
                onServer: true,
                fs: fs,
                logConfig: this.config.log.getConfig(),
                serverDebug: this.config.server.getDebug(),
                clientTimeoutValue: 100
            })));

        //});


    };
}

export default  AngularServerRenderer;

module.exports = AngularServerRenderer;