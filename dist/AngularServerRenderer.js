module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const jsdom = __webpack_require__(1);
	const dbug = __webpack_require__(2);
	const fs = __webpack_require__(3);
	const path = __webpack_require__(4);
	const shell = __webpack_require__(5);
	const simple_url_cache_1 = __webpack_require__(6);
	const sourceMapSupport = __webpack_require__(7);
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
	class AngularServerRenderer {
	    constructor(config) {
	        this.config = config;
	        this.middleware = () => {
	            var self = this;
	            return (req, res, next) => {
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
	                res.send = function (body) {
	                    if (typeof body === 'string') {
	                        self.render(body, req.url).then(function (result) {
	                            debug('MiddleWare successfully rendered');
	                            res.location(req.url);
	                            res.status(200);
	                            return send.apply(this, [result]);
	                        }).catch(function (err) {
	                            debug('MidleWare error rendering');
	                            res.status(500);
	                            res.location(req.url);
	                            return send.apply(this, [err]);
	                        });
	                    }
	                    else {
	                        return send.apply(this, [body]);
	                    }
	                };
	                next();
	            };
	        };
	        this.render = (html, url) => {
	            return new Promise((resolve, reject) => {
	                if (this.shouldRender(url) === false) {
	                    debug('This Angular URL should not be pre-rendered', url);
	                    resolve(html);
	                }
	                else {
	                    let cacheUrl = this.cache.url(url);
	                    cacheUrl.isCached().then((isCached) => {
	                        if (isCached === true) {
	                            debug('This URL is cached', url);
	                            cacheUrl.getUrl().then((res) => {
	                                resolve(res);
	                            });
	                        }
	                        else {
	                            jsdom.debugMode = true;
	                            let rendering = false;
	                            debug('SERVER URL = ', 'http://' + this.config.server.domain + ':' + this.config.server.port + url);
	                            let document = jsdom.jsdom(html, {
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
	                            let window = Object.assign(document.defaultView, {
	                                onServer: true,
	                                fs: fs,
	                                logConfig: this.config.log
	                            });
	                            debug('jsdom.jsdom loaded');
	                            let serverTimeout = setTimeout(() => {
	                                if (rendering)
	                                    return;
	                                debug('SERVER TIMEOUT ! ! !');
	                                rendering = true;
	                                let renderedHtml = this.getHTML(window, [serverTimeout]);
	                                cacheUrl.removeUrl().then(() => {
	                                    resolve(renderedHtml);
	                                    window.close();
	                                });
	                            }, this.config.server.timeout);
	                            window.addEventListener('ServerExceptionHandler', (err, data) => {
	                                rendering = true;
	                                cacheUrl.removeUrl().then(() => {
	                                    debug('EVENT LISTENER ON ServerExceptionHandler CATCHED', err.details);
	                                    reject(err.details);
	                                    window.close();
	                                    window.dispose();
	                                });
	                            });
	                            window.addEventListener('StackQueueEmpty', () => {
	                                debug('StackQueueEmpty event caught');
	                                if (rendering)
	                                    return;
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
	        debug('AngularServerRenderer initialized with config = ', this.config);
	        this.cache = new simple_url_cache_1.CacheEngine(this.config.cache.storageConfig, this.config.cache.cacheRules);
	        this.initiateLogFileStructure();
	    }
	    initiateLogFileStructure() {
	        this.config.log.dir = path.resolve(this.config.log.dir);
	        shell.mkdir('-p', this.config.log.dir);
	        const paths = [];
	        ['warn', 'log', 'debug', 'error', 'info'].forEach((item) => {
	            if (this.config.log[item].enabled) {
	                paths.push(path.resolve(path.join(this.config.log.dir, item)));
	            }
	        });
	        shell.touch(paths);
	    }
	    shouldRender(url) {
	        let i, regex;
	        switch (this.config.render.strategy) {
	            case 'none':
	                return false;
	            case 'all':
	                return true;
	            case 'include':
	                for (i in this.config.render.rules) {
	                    regex = this.config.render.rules[i];
	                    if (regex.test(url)) {
	                        return true;
	                    }
	                }
	                return false;
	            case 'exclude':
	                for (i in this.config.render.rules) {
	                    regex = this.config.render.rules[i];
	                    if (regex.test(url)) {
	                        return false;
	                    }
	                }
	                return true;
	        }
	    }
	    ;
	    getHTML(window, timeouts) {
	        debug('Getting HTML.');
	        let AngularDocument = window.angular.element(window.document);
	        let scope = AngularDocument.scope();
	        scope.$apply();
	        for (let i in timeouts) {
	            clearTimeout(timeouts[i]);
	        }
	        let html = window.document.documentElement.outerHTML;
	        debug('$cacheFactoryProvider', window.$cacheFactoryProvider);
	        if (typeof window.$cacheFactoryProvider !== 'undefined') {
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
	    }
	    ;
	}
	;
	module.exports = AngularServerRenderer;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("jsdom");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("debug");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("shelljs");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("simple-url-cache");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("source-map-support");

/***/ }
/******/ ]);
//# sourceMappingURL=AngularServerRenderer.js.map