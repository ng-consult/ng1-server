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
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var jsdom = __webpack_require__(1);
	var interfaces_1 = __webpack_require__(2);
	var EngineConfig_1 = __webpack_require__(3);
	var dbug = __webpack_require__(4);
	var fs = __webpack_require__(14);
	var sourceMapSupport = __webpack_require__(15);
	var requesting = __webpack_require__(16);
	var events = __webpack_require__(17);
	var uuid = __webpack_require__(18);
	var Helpers_1 = __webpack_require__(8);
	sourceMapSupport.install({
	    handleUncaughtExceptions: false
	});
	var debug = dbug('angular.js-server');
	var JSDOMEventEmitter = (function (_super) {
	    __extends(JSDOMEventEmitter, _super);
	    function JSDOMEventEmitter() {
	        _super.apply(this, arguments);
	    }
	    return JSDOMEventEmitter;
	}(events.EventEmitter));
	var AngularServerRenderer = (function () {
	    function AngularServerRenderer(config, cb) {
	        var _this = this;
	        this.addExternalResource = function (url, content, cb) {
	            debug('Adding external resource ', url);
	            _this.config.jsdomCache.url(url).set(content, false, cb);
	        };
	        this.middleware = function (req, res, next) {
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
	                    _this.render(body, req.url, function (err, result) {
	                        if (err) {
	                            debug('MidleWare error rendering', result.status);
	                            res.status(500);
	                            res.location(req.url);
	                            return send.apply(_this, [err.html]);
	                        }
	                        debug('MiddleWare successfully rendered', result.status);
	                        res.location(req.url);
	                        res.status(200);
	                        return send.apply(_this, [result.html]);
	                    });
	                }
	                else {
	                    return send.apply(_this, [body]);
	                }
	            };
	            next();
	        };
	        this.render = function (html, url, cb) {
	            Helpers_1.default.CheckType(url, 'string');
	            Helpers_1.default.CheckType(html, 'string');
	            var shouldRender = _this.config.render.shouldRender(url);
	            debug('Should render?', url, shouldRender);
	            if (!shouldRender) {
	                debug('This Angular URL should not be pre-rendered', url);
	                return cb(_this.send(null, html, interfaces_1.NGResponseCodes.RENDER_EXCLUDED));
	            }
	            else {
	                var cacheUrl_1 = _this.config.cache.url(url);
	                cacheUrl_1.has(function (err, isCached) {
	                    if (err)
	                        return cb(_this.send(null, html, interfaces_1.NGResponseCodes.CACHE_ENGINE_ERROR, err));
	                    debug('Is URL ', url, 'cached?', isCached);
	                    if (isCached === true) {
	                        debug('This URL is cached', url);
	                        cacheUrl_1.get(function (err, res) {
	                            if (err)
	                                return cb(_this.send(null, html, interfaces_1.NGResponseCodes.CACHE_ENGINE_ERROR, err));
	                            return cb(null, _this.send(null, res, interfaces_1.NGResponseCodes.ALREADY_CACHED));
	                        });
	                    }
	                    else {
	                        var rendering_1 = false;
	                        var uid_1 = uuid.v1();
	                        AngularServerRenderer.eventEmmiter.on(interfaces_1.JSDOM_EVENTS.JSDOM_ERROR + uid_1, function (error) {
	                            debug('Some JSDOM exception happened', error);
	                            _this.clearEventEmitterListeners(uid_1);
	                            cb(_this.send(window, html, interfaces_1.NGResponseCodes.JSDOM_ERROR, error));
	                        });
	                        AngularServerRenderer.eventEmmiter.on(interfaces_1.JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid_1, function (error) {
	                            _this.clearEventEmitterListeners(uid_1);
	                            cb(_this.send(window, html, interfaces_1.NGResponseCodes.JSDOM_ERROR, error));
	                        });
	                        AngularServerRenderer.eventEmmiter.on(interfaces_1.JSDOM_EVENTS.JSDOM_DONE_ERROR + uid_1, function (error) {
	                            _this.clearEventEmitterListeners(uid_1);
	                            cb(_this.send(window, html, interfaces_1.NGResponseCodes.JSDOM_ERROR, error));
	                        });
	                        AngularServerRenderer.eventEmmiter.on(interfaces_1.JSDOM_EVENTS.JSDOM_URL_ERROR + uid_1, function (error) {
	                            _this.clearEventEmitterListeners(uid_1);
	                            cb(_this.send(window, html, interfaces_1.NGResponseCodes.JSDOM_URL_ERROR, error));
	                        });
	                        _this.instanciateJSDOM(html, url, uid_1, function (err, win) {
	                            var window = win;
	                            if (err)
	                                return cb(_this.send(window, html, interfaces_1.NGResponseCodes.JSDOM_ERROR, err));
	                            var serverTimeout = setTimeout(function () {
	                                if (rendering_1)
	                                    return;
	                                debug('SERVER TIMEOUT ! ! !');
	                                rendering_1 = true;
	                                _this.clearEventEmitterListeners(uid_1);
	                                cacheUrl_1.delete(function (err, res) {
	                                    if (err)
	                                        cb(_this.send(window, html, interfaces_1.NGResponseCodes.CACHE_ENGINE_ERROR, err));
	                                    cb(_this.send(window, html, interfaces_1.NGResponseCodes.SERVER_TIMEOUT));
	                                    debug('window.close() called');
	                                    return;
	                                });
	                            }, _this.config.server.getTimeout());
	                            window.addEventListener('ServerExceptionHandler', function (err, data) {
	                                rendering_1 = true;
	                                _this.clearEventEmitterListeners(uid_1);
	                                cacheUrl_1.delete(function (err) {
	                                    if (err) {
	                                        debug('EVENT LISTENER ON ServerExceptionHandler CATCHED', err);
	                                        return cb(_this.send(window, html, interfaces_1.NGResponseCodes.CACHE_ENGINE_ERROR, err));
	                                    }
	                                    cb(_this.send(window, html, interfaces_1.NGResponseCodes.ERROR_HANDLER, err));
	                                    return;
	                                });
	                            });
	                            window.addEventListener('Idle', function () {
	                                debug('Idle event caught');
	                                if (rendering_1)
	                                    return;
	                                rendering_1 = true;
	                                var renderedHtml = _this.getHTML(window, [serverTimeout]);
	                                _this.clearEventEmitterListeners(uid_1);
	                                cacheUrl_1.set(renderedHtml, false, function (err, cacheStatus) {
	                                    if (err)
	                                        return cb(_this.send(window, html, interfaces_1.NGResponseCodes.CACHE_ENGINE_ERROR, err));
	                                    debug('url is now cached', url, cacheStatus);
	                                    cb(_this.send(window, renderedHtml, interfaces_1.NGResponseCodes.RENDERED));
	                                    return;
	                                });
	                            });
	                            window.addEventListener('load', function () {
	                                debug('Application is loaded in JSDOM');
	                            });
	                        });
	                    }
	                });
	            }
	        };
	        this.send = function (window, html, status, Exception) {
	            if (typeof interfaces_1.NGResponseCodes[status] === 'undefined') {
	                throw new Error('This status doesn\'t exist ' + status);
	            }
	            var trace = null, errorMsg;
	            if (Exception instanceof Error) {
	                trace = Error['stack'];
	                errorMsg = Exception.message;
	            }
	            else {
	                trace = new Error().stack;
	                errorMsg = Exception;
	            }
	            if (window) {
	                debug('closing window');
	                window.close();
	                window.dispose();
	            }
	            else {
	                debug('Window is not set: ', window);
	            }
	            return {
	                html: html,
	                code: status,
	                status: interfaces_1.NGResponseCodes[status],
	                errorMsg: errorMsg,
	                stacktrace: trace
	            };
	        };
	        this.clearEventEmitterListeners = function (uid) {
	            AngularServerRenderer.eventEmmiter.removeAllListeners(interfaces_1.JSDOM_EVENTS.JSDOM_ERROR + uid);
	            AngularServerRenderer.eventEmmiter.removeAllListeners(interfaces_1.JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid);
	            AngularServerRenderer.eventEmmiter.removeAllListeners(interfaces_1.JSDOM_EVENTS.JSDOM_DONE_ERROR + uid);
	            AngularServerRenderer.eventEmmiter.removeAllListeners(interfaces_1.JSDOM_EVENTS.JSDOM_URL_ERROR + uid);
	        };
	        this.getHTML = function (window, timeouts) {
	            debug('Getting HTML.');
	            var AngularDocument = window.angular.element(window.document);
	            var scope = AngularDocument.scope();
	            scope.$apply();
	            for (var i in timeouts) {
	                clearTimeout(timeouts[i]);
	            }
	            var html = window.document.documentElement.outerHTML;
	            if (typeof window.$cacheFactoryProvider !== 'undefined') {
	                debug('$cacheFactoryProvider', window.$cacheFactoryProvider);
	                var cachedData = window.$cacheFactoryProvider.exportAll();
	                var script = "<script type='text/javascript'> " +
	                    "/*No read only needed */" +
	                    "/*Object.defineProperty (window,'$angularServerCache', {value :  " + JSON.stringify(cachedData) + ",writable: false});*/"
	                    + "window.$angularServerCache = " + JSON.stringify(cachedData) + ";</script></head>";
	                debug('inserting the script: ', script);
	                html = html.replace(/<\/head>/i, script);
	            }
	            debug('returned HTML length: ', html.length);
	            return html;
	        };
	        this.config = new EngineConfig_1.default(config, function (err) {
	            if (err)
	                throw err;
	            cb(null);
	        });
	        debug('AngularServerRenderer initialized with config = ', config);
	    }
	    AngularServerRenderer.prototype.emptyExternalResources = function (cb) {
	        this.config.jsdomCache.clearInstance(cb);
	    };
	    ;
	    AngularServerRenderer.prototype.getExternalResources = function (cb) {
	        var _this = this;
	        var urls = [];
	        var nb = 0;
	        debug('getting external resources');
	        this.config.jsdomCache.getStoredHostnames(function (err, domains) {
	            if (err)
	                return cb(err);
	            domains.forEach(function (domain) {
	                _this.config.jsdomCache.getStoredURLs(domain, function (err, res) {
	                    if (err)
	                        return cb(err);
	                    urls[domain] = res;
	                    if (++nb === domains.length) {
	                        cb(null, urls);
	                    }
	                });
	            });
	        });
	    };
	    ;
	    AngularServerRenderer.prototype.$restCache = function (url, timeout) { };
	    AngularServerRenderer.prototype.jsDOMRequestUrl = function (uid, externalResources, resource, callback) {
	        var fixedURL = null, pathname = resource.url.pathname, url = resource.url.href;
	        debug('loading external resource  ', resource.url.pathname);
	        if (fixedURL === null) {
	            fixedURL = resource.url.href;
	        }
	        requesting(fixedURL, function (err, response, body) {
	            if (err) {
	                debug("Error fetching the url ", fixedURL, err);
	                AngularServerRenderer.eventEmmiter.emit(interfaces_1.JSDOM_EVENTS.JSDOM_URL_ERROR + uid, err);
	                return;
	            }
	            if (response.statusCode !== 200) {
	                debug("Error fetching ther url", fixedURL, response);
	                AngularServerRenderer.eventEmmiter.emit(interfaces_1.JSDOM_EVENTS.JSDOM_URL_ERROR + uid, response);
	                return;
	            }
	            return callback(null, body);
	        });
	    };
	    ;
	    AngularServerRenderer.prototype.instanciateJSDOM = function (html, url, uid, cb) {
	        var _this = this;
	        jsdom.debugMode = true;
	        var URL = this.config.server.getDomain() + url;
	        debug('SERVER URL = ', URL);
	        var debugVirtualConsole = jsdom.createVirtualConsole();
	        debugVirtualConsole.on("jsdomError", function (error) {
	            AngularServerRenderer.eventEmmiter.emit(interfaces_1.JSDOM_EVENTS.JSDOM_ERROR + uid, error);
	            debug('Some serious shit happened', error.detail);
	        });
	        var jsDomConsole;
	        var jsDomConsoleConfig = this.config.server.getJSDomConsole();
	        switch (jsDomConsoleConfig) {
	            case 'none':
	                jsDomConsole = debugVirtualConsole;
	                break;
	            case 'log':
	                jsDomConsole = debugVirtualConsole.sendTo(console, { omitJsdomErrors: true });
	                break;
	            case 'all':
	                jsDomConsole = debugVirtualConsole.sendTo(console);
	                break;
	        }
	        var document = jsdom.jsdom(html, {
	            features: {
	                FetchExternalResources: ['script'],
	                ProcessExternalResources: ['script']
	            },
	            resourceLoader: function (resource, callback) {
	                return _this.jsDOMRequestUrl(uid, [], resource, callback);
	            },
	            url: URL,
	            virtualConsole: jsDomConsole,
	            document: {
	                referrer: '',
	                cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
	                cookieDomain: this.config.server.getDomain()
	            },
	            created: function (error, window) {
	                if (error) {
	                    debug('Created event caught', error);
	                    AngularServerRenderer.eventEmmiter.emit(interfaces_1.JSDOM_EVENTS.JSDOM_CREATED_ERROR + uid, error);
	                }
	            },
	            done: function (error, window) {
	                if (error) {
	                    debug('Done event caught', error);
	                    AngularServerRenderer.eventEmmiter.emit(interfaces_1.JSDOM_EVENTS.JSDOM_DONE_ERROR + uid, error);
	                }
	            }
	        });
	        cb(null, (Object.assign(document.defaultView, {
	            onServer: true,
	            fs: fs,
	            logConfig: this.config.log.getConfig(),
	            serverDebug: this.config.server.getDebug(),
	            clientTimeoutValue: 100
	        })));
	    };
	    ;
	    AngularServerRenderer.eventEmmiter = new JSDOMEventEmitter();
	    return AngularServerRenderer;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AngularServerRenderer;
	module.exports = AngularServerRenderer;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("jsdom");

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	(function (NGResponseCodes) {
	    NGResponseCodes[NGResponseCodes["RENDERED"] = 0] = "RENDERED";
	    NGResponseCodes[NGResponseCodes["RENDER_EXCLUDED"] = 1] = "RENDER_EXCLUDED";
	    NGResponseCodes[NGResponseCodes["ALREADY_CACHED"] = 2] = "ALREADY_CACHED";
	    NGResponseCodes[NGResponseCodes["SERVER_TIMEOUT"] = 3] = "SERVER_TIMEOUT";
	    NGResponseCodes[NGResponseCodes["ERROR_HANDLER"] = 4] = "ERROR_HANDLER";
	    NGResponseCodes[NGResponseCodes["SERVER_ERROR"] = 5] = "SERVER_ERROR";
	    NGResponseCodes[NGResponseCodes["JSDOM_ERROR"] = 6] = "JSDOM_ERROR";
	    NGResponseCodes[NGResponseCodes["JSDOM_URL_ERROR"] = 7] = "JSDOM_URL_ERROR";
	    NGResponseCodes[NGResponseCodes["CACHE_ENGINE_ERROR"] = 8] = "CACHE_ENGINE_ERROR";
	})(exports.NGResponseCodes || (exports.NGResponseCodes = {}));
	var NGResponseCodes = exports.NGResponseCodes;
	(function (JSDOM_EVENTS) {
	    JSDOM_EVENTS[JSDOM_EVENTS["JSDOM_ERROR"] = 0] = "JSDOM_ERROR";
	    JSDOM_EVENTS[JSDOM_EVENTS["JSDOM_URL_ERROR"] = 1] = "JSDOM_URL_ERROR";
	    JSDOM_EVENTS[JSDOM_EVENTS["JSDOM_CREATED_ERROR"] = 2] = "JSDOM_CREATED_ERROR";
	    JSDOM_EVENTS[JSDOM_EVENTS["JSDOM_DONE_ERROR"] = 3] = "JSDOM_DONE_ERROR";
	})(exports.JSDOM_EVENTS || (exports.JSDOM_EVENTS = {}));
	var JSDOM_EVENTS = exports.JSDOM_EVENTS;
	;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var dbug = __webpack_require__(4);
	var cache_1 = __webpack_require__(5);
	var log_1 = __webpack_require__(7);
	var render_1 = __webpack_require__(12);
	var server_1 = __webpack_require__(13);
	var debug = dbug('angular.js-server');
	var EngineConfig = (function () {
	    function EngineConfig(config, cb) {
	        var _this = this;
	        this.server = new server_1.default();
	        this.log = new log_1.default(config.log);
	        this.render = new render_1.default();
	        this.server.importConfig(config.server);
	        this.render.importConfig(config.render);
	        var serverConfig = this.server.getStorageConfig();
	        var nb = 0;
	        new cache_1.default(this.server.getDomain(), 'SERVER', config.serverCache, serverConfig, function (err, cacheEngine) {
	            if (err)
	                throw err;
	            _this.cache = cacheEngine;
	            if (++nb === 3) {
	                cb(null);
	            }
	        });
	        new cache_1.default(this.server.getDomain(), 'REST', config.restCache, serverConfig, function (err, cacheEngine) {
	            if (err)
	                throw err;
	            _this.restCache = cacheEngine;
	            if (++nb === 3) {
	                cb(null);
	            }
	        });
	        new cache_1.default(this.server.getDomain(), 'JSDOM', config.jsdomCache, serverConfig, function (err, cacheEngine) {
	            if (err)
	                throw err;
	            _this.jsdomCache = cacheEngine;
	            if (++nb === 3) {
	                cb(null);
	            }
	        });
	    }
	    return EngineConfig;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = EngineConfig;


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("debug");

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var redis_url_cache_1 = __webpack_require__(6);
	var dbug = __webpack_require__(4);
	var debug = dbug('angular.js-server');
	var CacheConfig = (function () {
	    function CacheConfig(domain, instanceName, rules, storageConfig, cb) {
	        debug('building CacheConfig', domain, rules);
	        new redis_url_cache_1.CacheRulesCreator(instanceName, storageConfig, function (err, creator) {
	            if (err)
	                return cb(err);
	            creator.importRules(rules, function (err) {
	                if (err) {
	                    switch (err) {
	                        case 'A CacheRule definition already exists for this instance':
	                            break;
	                        default:
	                            return cb(err);
	                    }
	                }
	                var instance = new redis_url_cache_1.Instance(instanceName, storageConfig, {}, function (err) {
	                    if (err)
	                        return cb(err);
	                    cb(null, new redis_url_cache_1.CacheEngineCB(domain, instance));
	                });
	            });
	        });
	    }
	    CacheConfig.prototype.getCacheEngine = function () {
	        return this.cache;
	    };
	    return CacheConfig;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = CacheConfig;


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("redis-url-cache");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Helpers_1 = __webpack_require__(8);
	var path = __webpack_require__(10);
	var fs = __webpack_require__(11);
	var dbug = __webpack_require__(4);
	var debug = dbug('angular.js-server');
	var LogConfig = (function () {
	    function LogConfig(config) {
	        var _this = this;
	        this.logConfig = {
	            dir: path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/log/angular.js-server'),
	            log: { enabled: true, stack: false },
	            error: { enabled: true, stack: false },
	            warn: { enabled: true, stack: false },
	            info: { enabled: true, stack: false },
	            debug: { enabled: true, stack: false },
	            serverLogFile: 'angular-server.log'
	        };
	        this.configInstanciated = false;
	        this.setBasePath = function (path) {
	            Helpers_1.default.CheckType(path, 'string');
	            _this.logConfig.dir = path;
	        };
	        this.setDefinition = function (log, enabled, stack) {
	            Helpers_1.default.CheckType(log, 'string');
	            Helpers_1.default.CheckType(enabled, 'boolean');
	            _this.logConfig[log].enabled = enabled;
	            _this.logConfig[log].stack = stack ? true : false;
	        };
	        this.setFileServerName = function (name) {
	            Helpers_1.default.CheckType(name, 'string');
	            _this.logConfig.serverLogFile = name;
	        };
	        this.getBasePath = function () {
	            return _this.logConfig.dir;
	        };
	        this.getDefinition = function (log) {
	            return _this.logConfig[log];
	        };
	        this.getFileServerName = function () {
	            return _this.logConfig.serverLogFile;
	        };
	        this.getLogPath = function (log) {
	            return path.join(_this.logConfig.dir, log + '.log');
	        };
	        this.getLogServerPath = function () {
	            return path.join(_this.logConfig.dir, _this.logConfig.serverLogFile + '.log');
	        };
	        this.getConfig = function () {
	            return _this.logConfig;
	        };
	        this.log = function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            fs.appendFileSync(_this.getLogServerPath(), args.join(', ') + '\n');
	        };
	        this.setBasePath(config.dir);
	        ['log', 'warn', 'error', 'info', 'debug'].forEach(function (log) {
	            _this.setDefinition(log, config[log].enabled, config[log].stack);
	        });
	        this.setFileServerName(config.serverLogFile);
	        this.initialize();
	    }
	    LogConfig.prototype.initialize = function () {
	        var _this = this;
	        this.logConfig.dir = path.resolve(path.normalize(this.logConfig.dir));
	        try {
	            fs.mkdirsSync(this.logConfig.dir);
	        }
	        catch (e) {
	            Helpers_1.default.Error("can't create the log dir", this.logConfig.dir, e);
	        }
	        var paths = [];
	        ['warn', 'log', 'debug', 'error', 'info'].forEach(function (item) {
	            if (_this.logConfig[item].enabled) {
	                paths.push(_this.getLogPath(item));
	            }
	        });
	        paths.push(path.resolve(path.join(this.logConfig.dir, 'dev.log')));
	        paths.push(this.getLogServerPath());
	        paths.forEach(function (path) {
	            try {
	                fs.closeSync(fs.openSync(path, 'a'));
	            }
	            catch (e) {
	                Helpers_1.default.Error(e);
	            }
	        });
	    };
	    ;
	    return LogConfig;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = LogConfig;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var nodeurl = __webpack_require__(9);
	var debug = __webpack_require__(4)('angular.js-server');
	var Helpers = (function () {
	    function Helpers() {
	    }
	    Helpers.Error = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        throw new Error(args.join(', '));
	    };
	    Helpers.SameRegex = function (r1, r2) {
	        debug('checking if rules are the same', r1, r2);
	        if (r1 instanceof RegExp && r2 instanceof RegExp) {
	            var props = ["global", "multiline", "ignoreCase", "source"];
	            for (var i = 0; i < props.length; i++) {
	                var prop = props[i];
	                if (r1[prop] !== r2[prop]) {
	                    debug('props diff', prop, r1[prop], r2[prop]);
	                    return false;
	                }
	            }
	            return true;
	        }
	        return false;
	    };
	    Helpers.CheckHostname = function (domain) {
	        Helpers.CheckType(domain, 'string');
	        var parsedURL = nodeurl.parse(domain);
	        parsedURL.pathname = null;
	        parsedURL.path = null;
	        parsedURL.hash = null;
	        parsedURL.query = null;
	        parsedURL.search = null;
	        var formattedDmain = nodeurl.format(parsedURL);
	        debug('Checking domain ', domain, formattedDmain);
	        if (formattedDmain.length === 0) {
	            Helpers.Error('Invalid domain name provided', domain, formattedDmain);
	        }
	        return nodeurl.parse(formattedDmain);
	    };
	    Helpers.CheckType = function (input, type) {
	        if (typeof input === 'object') {
	            if (typeof type === 'string' && input.constructor !== type) {
	                Helpers.Error('This input is not a valid', type, input, ' type is', input);
	            }
	            else if (typeof type === 'array') {
	                var valid = false;
	                type.forEach(function (item) {
	                    if (input.constructor === item) {
	                        valid = true;
	                    }
	                });
	                if (!valid) {
	                    Helpers.Error(input, 'Doesn\'t match any of these types', type, ' got ', input.constructor);
	                }
	            }
	        }
	        else {
	            if (typeof type === 'string' && typeof input !== type) {
	                Helpers.Error('This input is not a valid', type, input, ' type is', typeof input);
	            }
	            else if (typeof type === 'array') {
	                var valid = false;
	                type.forEach(function (item) {
	                    if (typeof input === item) {
	                        valid = true;
	                    }
	                });
	                if (!valid) {
	                    Helpers.Error(input, 'Doesn\'t match any of these types', type, ' got ', typeof input);
	                }
	            }
	        }
	    };
	    Helpers.StringIn = function (input, validValues) {
	        Helpers.CheckType(input, 'string');
	        if (validValues.length === 0) {
	            return;
	        }
	        var valid = false;
	        validValues.forEach(function (item) {
	            if (item === input) {
	                valid = true;
	            }
	        });
	        if (!valid) {
	            Helpers.Error(input, 'should match', validValues);
	        }
	    };
	    Helpers.RegexNotIn = function (regex, regexes, desc) {
	        if (regexes.length === 0) {
	            return;
	        }
	        Helpers.CheckType(regex, RegExp);
	        regexes.forEach(function (item) {
	            if (Helpers.SameRegex(item, regex)) {
	                Helpers.Error(item, ' Is already defined ', desc);
	            }
	        });
	    };
	    return Helpers;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Helpers;


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("fs-extra");

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Helpers_1 = __webpack_require__(8);
	var dbug = __webpack_require__(4);
	var debug = dbug('angular.js-server');
	var RenderConfig = (function () {
	    function RenderConfig() {
	        this.renderConfig = {
	            strategy: 'never',
	            rules: []
	        };
	    }
	    RenderConfig.prototype.importConfig = function (config) {
	        var _this = this;
	        this.setStrategy(config.strategy);
	        config.rules.forEach(function (rule) {
	            _this.addRule(rule);
	        });
	    };
	    RenderConfig.prototype.shouldRender = function (url) {
	        var i, regex;
	        Helpers_1.default.CheckType(url, 'string');
	        debug('shouldRender called with url, renderConfig ', url, this.renderConfig);
	        switch (this.renderConfig.strategy) {
	            case 'never':
	                return false;
	            case 'always':
	                return true;
	            case 'include':
	                for (i in this.renderConfig.rules) {
	                    regex = this.renderConfig.rules[i];
	                    if (regex.test(url)) {
	                        return true;
	                    }
	                }
	                return false;
	            case 'exclude':
	                for (i in this.renderConfig.rules) {
	                    regex = this.renderConfig.rules[i];
	                    if (regex.test(url)) {
	                        return false;
	                    }
	                }
	                return true;
	        }
	    };
	    ;
	    RenderConfig.prototype.setStrategy = function (strategy) {
	        Helpers_1.default.StringIn(strategy, ['include', 'exclude', 'always', 'never']);
	        this.renderConfig.strategy = strategy;
	    };
	    ;
	    RenderConfig.prototype.addRule = function (rule) {
	        Helpers_1.default.CheckType(rule, RegExp);
	        Helpers_1.default.RegexNotIn(rule, this.renderConfig.rules);
	        this.renderConfig.rules.push(rule);
	    };
	    ;
	    RenderConfig.prototype.removeRule = function (rule) {
	        Helpers_1.default.CheckType(rule, RegExp);
	        var index = null;
	        for (var i in this.renderConfig.rules) {
	            if (Helpers_1.default.SameRegex(this.renderConfig.rules[i], rule)) {
	                index = i;
	            }
	        }
	        if (index !== null) {
	            this.renderConfig.rules.splice(index, 1);
	        }
	    };
	    ;
	    RenderConfig.prototype.getStrategy = function () {
	        return this.renderConfig.strategy;
	    };
	    ;
	    RenderConfig.prototype.getRules = function () {
	        return this.renderConfig.rules;
	    };
	    ;
	    RenderConfig.prototype.hasRule = function (rule) {
	        Helpers_1.default.CheckType(rule, RegExp);
	        for (var i in this.renderConfig.rules) {
	            if (Helpers_1.default.SameRegex(this.renderConfig.rules[i], rule)) {
	                return true;
	            }
	        }
	        return false;
	    };
	    ;
	    return RenderConfig;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = RenderConfig;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Helpers_1 = __webpack_require__(8);
	var dbug = __webpack_require__(4);
	var nodeurl = __webpack_require__(9);
	var debug = dbug('angular.js-server');
	var ServerConfig = (function () {
	    function ServerConfig() {
	        var _this = this;
	        this.setDomain = function (domain) {
	            var parsedUrl = nodeurl.parse(domain);
	            var url = Helpers_1.default.CheckHostname(domain);
	            url.pathname = null;
	            url.hash = null;
	            url.search = null;
	            url.query = null;
	            url.path = null;
	            _this.serverConfig.domain = nodeurl.format(url);
	        };
	        this.setTimeout = function (timeout) {
	            Helpers_1.default.CheckType(timeout, 'number');
	            _this.serverConfig.timeout = timeout;
	        };
	        this.setDebug = function (debug) {
	            Helpers_1.default.CheckType(debug, 'boolean');
	            _this.serverConfig.debug = debug;
	        };
	        this.setBase = function (base) {
	            Helpers_1.default.CheckType(base, 'string');
	            _this.serverConfig.base = base;
	        };
	        this.getDomain = function () {
	            return _this.serverConfig.domain;
	        };
	        this.getTimeout = function () {
	            return _this.serverConfig.timeout * 1000;
	        };
	        this.getDebug = function () {
	            return _this.serverConfig.debug;
	        };
	        this.getBase = function () {
	            return _this.serverConfig.base;
	        };
	        var storageConfig = {
	            "host": "127.0.0.1",
	            "port": 6379,
	            "socket_keepalive": true
	        };
	        this.serverConfig = {
	            domain: 'http://localhost',
	            timeout: 10000,
	            debug: true,
	            base: '/',
	            jsdomConsole: 'log',
	            storageConfig: storageConfig
	        };
	    }
	    ServerConfig.prototype.importConfig = function (config) {
	        this.setDomain(config.domain);
	        this.setTimeout(config.timeout);
	        this.setDebug(config.debug);
	        this.setBase(config.base);
	        this.setJSDomCOnsole(config.jsdomConsole);
	        this.setStorageConfig(config.storageConfig);
	    };
	    ServerConfig.prototype.setStorageConfig = function (storageConfig) {
	        this.serverConfig.storageConfig = storageConfig;
	    };
	    ServerConfig.prototype.setJSDomCOnsole = function (jsdomConsole) {
	        this.serverConfig.jsdomConsole = jsdomConsole;
	    };
	    ServerConfig.prototype.getStorageConfig = function () {
	        return this.serverConfig.storageConfig;
	    };
	    ServerConfig.prototype.getJSDomConsole = function () {
	        return this.serverConfig.jsdomConsole;
	    };
	    return ServerConfig;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ServerConfig;


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("source-map-support");

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = require("node-uuid");

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgODg1YmJiZmNjZmY5OTMxYjVkZDMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0FuZ3VsYXJTZXJ2ZXJSZW5kZXJlci50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqc2RvbVwiIiwid2VicGFjazovLy8uL3NyYy9pbnRlcmZhY2VzLnRzIiwid2VicGFjazovLy8uL3NyYy9FbmdpbmVDb25maWcudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZGVidWdcIiIsIndlYnBhY2s6Ly8vLi9zcmMvY29uZmlnL2NhY2hlLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInJlZGlzLXVybC1jYWNoZVwiIiwid2VicGFjazovLy8uL3NyYy9jb25maWcvbG9nLnRzIiwid2VicGFjazovLy8uL3NyYy9IZWxwZXJzLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcInVybFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBhdGhcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmcy1leHRyYVwiIiwid2VicGFjazovLy8uL3NyYy9jb25maWcvcmVuZGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9jb25maWcvc2VydmVyLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcImZzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwic291cmNlLW1hcC1zdXBwb3J0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVxdWVzdFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV2ZW50c1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcIm5vZGUtdXVpZFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztB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QUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsRUFBQztBQUNELCtDQUE4QyxjQUFjO0FBQzVEOzs7Ozs7O0FDMUdBLGlDOzs7Ozs7QUNBQSxrQzs7Ozs7O0FDQUEsc0M7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRCwrQ0FBOEMsY0FBYztBQUM1RDs7Ozs7OztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNELCtDQUE4QyxjQUFjO0FBQzVEOzs7Ozs7O0FDL0VBLGdDOzs7Ozs7QUNBQSxnRDs7Ozs7O0FDQUEscUM7Ozs7OztBQ0FBLG9DOzs7Ozs7QUNBQSx1QyIsImZpbGUiOiJBbmd1bGFyU2VydmVyUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDg4NWJiYmZjY2ZmOTkzMWI1ZGQzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07XG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xufTtcbnZhciBqc2RvbSA9IHJlcXVpcmUoJ2pzZG9tJyk7XG52YXIgaW50ZXJmYWNlc18xID0gcmVxdWlyZSgnLi9pbnRlcmZhY2VzJyk7XG52YXIgRW5naW5lQ29uZmlnXzEgPSByZXF1aXJlKCcuL0VuZ2luZUNvbmZpZycpO1xudmFyIGRidWcgPSByZXF1aXJlKCdkZWJ1ZycpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciBzb3VyY2VNYXBTdXBwb3J0ID0gcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0Jyk7XG52YXIgcmVxdWVzdGluZyA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcbnZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcbnZhciB1dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG52YXIgSGVscGVyc18xID0gcmVxdWlyZSgnLi9IZWxwZXJzJyk7XG5zb3VyY2VNYXBTdXBwb3J0Lmluc3RhbGwoe1xuICAgIGhhbmRsZVVuY2F1Z2h0RXhjZXB0aW9uczogZmFsc2Vcbn0pO1xudmFyIGRlYnVnID0gZGJ1ZygnYW5ndWxhci5qcy1zZXJ2ZXInKTtcbnZhciBKU0RPTUV2ZW50RW1pdHRlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKEpTRE9NRXZlbnRFbWl0dGVyLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEpTRE9NRXZlbnRFbWl0dGVyKCkge1xuICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgcmV0dXJuIEpTRE9NRXZlbnRFbWl0dGVyO1xufShldmVudHMuRXZlbnRFbWl0dGVyKSk7XG52YXIgQW5ndWxhclNlcnZlclJlbmRlcmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBbmd1bGFyU2VydmVyUmVuZGVyZXIoY29uZmlnLCBjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmFkZEV4dGVybmFsUmVzb3VyY2UgPSBmdW5jdGlvbiAodXJsLCBjb250ZW50LCBjYikge1xuICAgICAgICAgICAgZGVidWcoJ0FkZGluZyBleHRlcm5hbCByZXNvdXJjZSAnLCB1cmwpO1xuICAgICAgICAgICAgX3RoaXMuY29uZmlnLmpzZG9tQ2FjaGUudXJsKHVybCkuc2V0KGNvbnRlbnQsIGZhbHNlLCBjYik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWlkZGxld2FyZSA9IGZ1bmN0aW9uIChyZXEsIHJlcywgbmV4dCkge1xuICAgICAgICAgICAgZGVidWcoJ01pZGRsZVdhcmUgY2FsbGVkIHdpdGggVVJMICcsIHJlcS51cmwpO1xuICAgICAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnKSB7XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcS54aHIgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoL3RleHRcXC9odG1sLy50ZXN0KHJlcS5nZXQoJ2FjY2VwdCcpKSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzZW5kID0gcmVzLnNlbmQuYmluZChyZXMpO1xuICAgICAgICAgICAgcmVzLnNlbmQgPSBmdW5jdGlvbiAoYm9keSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMucmVuZGVyKGJvZHksIHJlcS51cmwsIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdNaWRsZVdhcmUgZXJyb3IgcmVuZGVyaW5nJywgcmVzdWx0LnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5sb2NhdGlvbihyZXEudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VuZC5hcHBseShfdGhpcywgW2Vyci5odG1sXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnTWlkZGxlV2FyZSBzdWNjZXNzZnVsbHkgcmVuZGVyZWQnLCByZXN1bHQuc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5sb2NhdGlvbihyZXEudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZW5kLmFwcGx5KF90aGlzLCBbcmVzdWx0Lmh0bWxdKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VuZC5hcHBseShfdGhpcywgW2JvZHldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlbmRlciA9IGZ1bmN0aW9uIChodG1sLCB1cmwsIGNiKSB7XG4gICAgICAgICAgICBIZWxwZXJzXzEuZGVmYXVsdC5DaGVja1R5cGUodXJsLCAnc3RyaW5nJyk7XG4gICAgICAgICAgICBIZWxwZXJzXzEuZGVmYXVsdC5DaGVja1R5cGUoaHRtbCwgJ3N0cmluZycpO1xuICAgICAgICAgICAgdmFyIHNob3VsZFJlbmRlciA9IF90aGlzLmNvbmZpZy5yZW5kZXIuc2hvdWxkUmVuZGVyKHVybCk7XG4gICAgICAgICAgICBkZWJ1ZygnU2hvdWxkIHJlbmRlcj8nLCB1cmwsIHNob3VsZFJlbmRlcik7XG4gICAgICAgICAgICBpZiAoIXNob3VsZFJlbmRlcikge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdUaGlzIEFuZ3VsYXIgVVJMIHNob3VsZCBub3QgYmUgcHJlLXJlbmRlcmVkJywgdXJsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoX3RoaXMuc2VuZChudWxsLCBodG1sLCBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzLlJFTkRFUl9FWENMVURFRCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhY2hlVXJsXzEgPSBfdGhpcy5jb25maWcuY2FjaGUudXJsKHVybCk7XG4gICAgICAgICAgICAgICAgY2FjaGVVcmxfMS5oYXMoZnVuY3Rpb24gKGVyciwgaXNDYWNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihfdGhpcy5zZW5kKG51bGwsIGh0bWwsIGludGVyZmFjZXNfMS5OR1Jlc3BvbnNlQ29kZXMuQ0FDSEVfRU5HSU5FX0VSUk9SLCBlcnIpKTtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoJ0lzIFVSTCAnLCB1cmwsICdjYWNoZWQ/JywgaXNDYWNoZWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDYWNoZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdUaGlzIFVSTCBpcyBjYWNoZWQnLCB1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVVcmxfMS5nZXQoZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKF90aGlzLnNlbmQobnVsbCwgaHRtbCwgaW50ZXJmYWNlc18xLk5HUmVzcG9uc2VDb2Rlcy5DQUNIRV9FTkdJTkVfRVJST1IsIGVycikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihudWxsLCBfdGhpcy5zZW5kKG51bGwsIHJlcywgaW50ZXJmYWNlc18xLk5HUmVzcG9uc2VDb2Rlcy5BTFJFQURZX0NBQ0hFRCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVuZGVyaW5nXzEgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1aWRfMSA9IHV1aWQudjEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlci5ldmVudEVtbWl0ZXIub24oaW50ZXJmYWNlc18xLkpTRE9NX0VWRU5UUy5KU0RPTV9FUlJPUiArIHVpZF8xLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnU29tZSBKU0RPTSBleGNlcHRpb24gaGFwcGVuZWQnLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY2xlYXJFdmVudEVtaXR0ZXJMaXN0ZW5lcnModWlkXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKF90aGlzLnNlbmQod2luZG93LCBodG1sLCBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzLkpTRE9NX0VSUk9SLCBlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBbmd1bGFyU2VydmVyUmVuZGVyZXIuZXZlbnRFbW1pdGVyLm9uKGludGVyZmFjZXNfMS5KU0RPTV9FVkVOVFMuSlNET01fQ1JFQVRFRF9FUlJPUiArIHVpZF8xLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jbGVhckV2ZW50RW1pdHRlckxpc3RlbmVycyh1aWRfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoX3RoaXMuc2VuZCh3aW5kb3csIGh0bWwsIGludGVyZmFjZXNfMS5OR1Jlc3BvbnNlQ29kZXMuSlNET01fRVJST1IsIGVycm9yKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlci5ldmVudEVtbWl0ZXIub24oaW50ZXJmYWNlc18xLkpTRE9NX0VWRU5UUy5KU0RPTV9ET05FX0VSUk9SICsgdWlkXzEsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNsZWFyRXZlbnRFbWl0dGVyTGlzdGVuZXJzKHVpZF8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihfdGhpcy5zZW5kKHdpbmRvdywgaHRtbCwgaW50ZXJmYWNlc18xLk5HUmVzcG9uc2VDb2Rlcy5KU0RPTV9FUlJPUiwgZXJyb3IpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgQW5ndWxhclNlcnZlclJlbmRlcmVyLmV2ZW50RW1taXRlci5vbihpbnRlcmZhY2VzXzEuSlNET01fRVZFTlRTLkpTRE9NX1VSTF9FUlJPUiArIHVpZF8xLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jbGVhckV2ZW50RW1pdHRlckxpc3RlbmVycyh1aWRfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IoX3RoaXMuc2VuZCh3aW5kb3csIGh0bWwsIGludGVyZmFjZXNfMS5OR1Jlc3BvbnNlQ29kZXMuSlNET01fVVJMX0VSUk9SLCBlcnJvcikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5pbnN0YW5jaWF0ZUpTRE9NKGh0bWwsIHVybCwgdWlkXzEsIGZ1bmN0aW9uIChlcnIsIHdpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aW5kb3cgPSB3aW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKF90aGlzLnNlbmQod2luZG93LCBodG1sLCBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzLkpTRE9NX0VSUk9SLCBlcnIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VydmVyVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVuZGVyaW5nXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdTRVJWRVIgVElNRU9VVCAhICEgIScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJpbmdfMSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNsZWFyRXZlbnRFbWl0dGVyTGlzdGVuZXJzKHVpZF8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVVcmxfMS5kZWxldGUoZnVuY3Rpb24gKGVyciwgcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKF90aGlzLnNlbmQod2luZG93LCBodG1sLCBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzLkNBQ0hFX0VOR0lORV9FUlJPUiwgZXJyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihfdGhpcy5zZW5kKHdpbmRvdywgaHRtbCwgaW50ZXJmYWNlc18xLk5HUmVzcG9uc2VDb2Rlcy5TRVJWRVJfVElNRU9VVCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoJ3dpbmRvdy5jbG9zZSgpIGNhbGxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBfdGhpcy5jb25maWcuc2VydmVyLmdldFRpbWVvdXQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ1NlcnZlckV4Y2VwdGlvbkhhbmRsZXInLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmluZ18xID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY2xlYXJFdmVudEVtaXR0ZXJMaXN0ZW5lcnModWlkXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVVybF8xLmRlbGV0ZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoJ0VWRU5UIExJU1RFTkVSIE9OIFNlcnZlckV4Y2VwdGlvbkhhbmRsZXIgQ0FUQ0hFRCcsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKF90aGlzLnNlbmQod2luZG93LCBodG1sLCBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzLkNBQ0hFX0VOR0lORV9FUlJPUiwgZXJyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihfdGhpcy5zZW5kKHdpbmRvdywgaHRtbCwgaW50ZXJmYWNlc18xLk5HUmVzcG9uc2VDb2Rlcy5FUlJPUl9IQU5ETEVSLCBlcnIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0lkbGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdJZGxlIGV2ZW50IGNhdWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVuZGVyaW5nXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmluZ18xID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlbmRlcmVkSHRtbCA9IF90aGlzLmdldEhUTUwod2luZG93LCBbc2VydmVyVGltZW91dF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jbGVhckV2ZW50RW1pdHRlckxpc3RlbmVycyh1aWRfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlVXJsXzEuc2V0KHJlbmRlcmVkSHRtbCwgZmFsc2UsIGZ1bmN0aW9uIChlcnIsIGNhY2hlU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihfdGhpcy5zZW5kKHdpbmRvdywgaHRtbCwgaW50ZXJmYWNlc18xLk5HUmVzcG9uc2VDb2Rlcy5DQUNIRV9FTkdJTkVfRVJST1IsIGVycikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoJ3VybCBpcyBub3cgY2FjaGVkJywgdXJsLCBjYWNoZVN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihfdGhpcy5zZW5kKHdpbmRvdywgcmVuZGVyZWRIdG1sLCBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzLlJFTkRFUkVEKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnQXBwbGljYXRpb24gaXMgbG9hZGVkIGluIEpTRE9NJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNlbmQgPSBmdW5jdGlvbiAod2luZG93LCBodG1sLCBzdGF0dXMsIEV4Y2VwdGlvbikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzW3N0YXR1c10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHN0YXR1cyBkb2VzblxcJ3QgZXhpc3QgJyArIHN0YXR1cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdHJhY2UgPSBudWxsLCBlcnJvck1zZztcbiAgICAgICAgICAgIGlmIChFeGNlcHRpb24gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgIHRyYWNlID0gRXJyb3JbJ3N0YWNrJ107XG4gICAgICAgICAgICAgICAgZXJyb3JNc2cgPSBFeGNlcHRpb24ubWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyYWNlID0gbmV3IEVycm9yKCkuc3RhY2s7XG4gICAgICAgICAgICAgICAgZXJyb3JNc2cgPSBFeGNlcHRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAod2luZG93KSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ2Nsb3Npbmcgd2luZG93Jyk7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgd2luZG93LmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdXaW5kb3cgaXMgbm90IHNldDogJywgd2luZG93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaHRtbDogaHRtbCxcbiAgICAgICAgICAgICAgICBjb2RlOiBzdGF0dXMsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBpbnRlcmZhY2VzXzEuTkdSZXNwb25zZUNvZGVzW3N0YXR1c10sXG4gICAgICAgICAgICAgICAgZXJyb3JNc2c6IGVycm9yTXNnLFxuICAgICAgICAgICAgICAgIHN0YWNrdHJhY2U6IHRyYWNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNsZWFyRXZlbnRFbWl0dGVyTGlzdGVuZXJzID0gZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICAgICAgQW5ndWxhclNlcnZlclJlbmRlcmVyLmV2ZW50RW1taXRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoaW50ZXJmYWNlc18xLkpTRE9NX0VWRU5UUy5KU0RPTV9FUlJPUiArIHVpZCk7XG4gICAgICAgICAgICBBbmd1bGFyU2VydmVyUmVuZGVyZXIuZXZlbnRFbW1pdGVyLnJlbW92ZUFsbExpc3RlbmVycyhpbnRlcmZhY2VzXzEuSlNET01fRVZFTlRTLkpTRE9NX0NSRUFURURfRVJST1IgKyB1aWQpO1xuICAgICAgICAgICAgQW5ndWxhclNlcnZlclJlbmRlcmVyLmV2ZW50RW1taXRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoaW50ZXJmYWNlc18xLkpTRE9NX0VWRU5UUy5KU0RPTV9ET05FX0VSUk9SICsgdWlkKTtcbiAgICAgICAgICAgIEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlci5ldmVudEVtbWl0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKGludGVyZmFjZXNfMS5KU0RPTV9FVkVOVFMuSlNET01fVVJMX0VSUk9SICsgdWlkKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRIVE1MID0gZnVuY3Rpb24gKHdpbmRvdywgdGltZW91dHMpIHtcbiAgICAgICAgICAgIGRlYnVnKCdHZXR0aW5nIEhUTUwuJyk7XG4gICAgICAgICAgICB2YXIgQW5ndWxhckRvY3VtZW50ID0gd2luZG93LmFuZ3VsYXIuZWxlbWVudCh3aW5kb3cuZG9jdW1lbnQpO1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gQW5ndWxhckRvY3VtZW50LnNjb3BlKCk7XG4gICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGltZW91dHMpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dHNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGh0bWwgPSB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTDtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93LiRjYWNoZUZhY3RvcnlQcm92aWRlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZygnJGNhY2hlRmFjdG9yeVByb3ZpZGVyJywgd2luZG93LiRjYWNoZUZhY3RvcnlQcm92aWRlcik7XG4gICAgICAgICAgICAgICAgdmFyIGNhY2hlZERhdGEgPSB3aW5kb3cuJGNhY2hlRmFjdG9yeVByb3ZpZGVyLmV4cG9ydEFsbCgpO1xuICAgICAgICAgICAgICAgIHZhciBzY3JpcHQgPSBcIjxzY3JpcHQgdHlwZT0ndGV4dC9qYXZhc2NyaXB0Jz4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIi8qTm8gcmVhZCBvbmx5IG5lZWRlZCAqL1wiICtcbiAgICAgICAgICAgICAgICAgICAgXCIvKk9iamVjdC5kZWZpbmVQcm9wZXJ0eSAod2luZG93LCckYW5ndWxhclNlcnZlckNhY2hlJywge3ZhbHVlIDogIFwiICsgSlNPTi5zdHJpbmdpZnkoY2FjaGVkRGF0YSkgKyBcIix3cml0YWJsZTogZmFsc2V9KTsqL1wiXG4gICAgICAgICAgICAgICAgICAgICsgXCJ3aW5kb3cuJGFuZ3VsYXJTZXJ2ZXJDYWNoZSA9IFwiICsgSlNPTi5zdHJpbmdpZnkoY2FjaGVkRGF0YSkgKyBcIjs8L3NjcmlwdD48L2hlYWQ+XCI7XG4gICAgICAgICAgICAgICAgZGVidWcoJ2luc2VydGluZyB0aGUgc2NyaXB0OiAnLCBzY3JpcHQpO1xuICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLzxcXC9oZWFkPi9pLCBzY3JpcHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVidWcoJ3JldHVybmVkIEhUTUwgbGVuZ3RoOiAnLCBodG1sLmxlbmd0aCk7XG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb25maWcgPSBuZXcgRW5naW5lQ29uZmlnXzEuZGVmYXVsdChjb25maWcsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgY2IobnVsbCk7XG4gICAgICAgIH0pO1xuICAgICAgICBkZWJ1ZygnQW5ndWxhclNlcnZlclJlbmRlcmVyIGluaXRpYWxpemVkIHdpdGggY29uZmlnID0gJywgY29uZmlnKTtcbiAgICB9XG4gICAgQW5ndWxhclNlcnZlclJlbmRlcmVyLnByb3RvdHlwZS5lbXB0eUV4dGVybmFsUmVzb3VyY2VzID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLmpzZG9tQ2FjaGUuY2xlYXJJbnN0YW5jZShjYik7XG4gICAgfTtcbiAgICA7XG4gICAgQW5ndWxhclNlcnZlclJlbmRlcmVyLnByb3RvdHlwZS5nZXRFeHRlcm5hbFJlc291cmNlcyA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgdXJscyA9IFtdO1xuICAgICAgICB2YXIgbmIgPSAwO1xuICAgICAgICBkZWJ1ZygnZ2V0dGluZyBleHRlcm5hbCByZXNvdXJjZXMnKTtcbiAgICAgICAgdGhpcy5jb25maWcuanNkb21DYWNoZS5nZXRTdG9yZWRIb3N0bmFtZXMoZnVuY3Rpb24gKGVyciwgZG9tYWlucykge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgIGRvbWFpbnMuZm9yRWFjaChmdW5jdGlvbiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuY29uZmlnLmpzZG9tQ2FjaGUuZ2V0U3RvcmVkVVJMcyhkb21haW4sIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHVybHNbZG9tYWluXSA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCsrbmIgPT09IGRvbWFpbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihudWxsLCB1cmxzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgO1xuICAgIEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlci5wcm90b3R5cGUuJHJlc3RDYWNoZSA9IGZ1bmN0aW9uICh1cmwsIHRpbWVvdXQpIHsgfTtcbiAgICBBbmd1bGFyU2VydmVyUmVuZGVyZXIucHJvdG90eXBlLmpzRE9NUmVxdWVzdFVybCA9IGZ1bmN0aW9uICh1aWQsIGV4dGVybmFsUmVzb3VyY2VzLCByZXNvdXJjZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGZpeGVkVVJMID0gbnVsbCwgcGF0aG5hbWUgPSByZXNvdXJjZS51cmwucGF0aG5hbWUsIHVybCA9IHJlc291cmNlLnVybC5ocmVmO1xuICAgICAgICBkZWJ1ZygnbG9hZGluZyBleHRlcm5hbCByZXNvdXJjZSAgJywgcmVzb3VyY2UudXJsLnBhdGhuYW1lKTtcbiAgICAgICAgaWYgKGZpeGVkVVJMID09PSBudWxsKSB7XG4gICAgICAgICAgICBmaXhlZFVSTCA9IHJlc291cmNlLnVybC5ocmVmO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RpbmcoZml4ZWRVUkwsIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoXCJFcnJvciBmZXRjaGluZyB0aGUgdXJsIFwiLCBmaXhlZFVSTCwgZXJyKTtcbiAgICAgICAgICAgICAgICBBbmd1bGFyU2VydmVyUmVuZGVyZXIuZXZlbnRFbW1pdGVyLmVtaXQoaW50ZXJmYWNlc18xLkpTRE9NX0VWRU5UUy5KU0RPTV9VUkxfRVJST1IgKyB1aWQsIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiRXJyb3IgZmV0Y2hpbmcgdGhlciB1cmxcIiwgZml4ZWRVUkwsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBBbmd1bGFyU2VydmVyUmVuZGVyZXIuZXZlbnRFbW1pdGVyLmVtaXQoaW50ZXJmYWNlc18xLkpTRE9NX0VWRU5UUy5KU0RPTV9VUkxfRVJST1IgKyB1aWQsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgYm9keSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgO1xuICAgIEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlci5wcm90b3R5cGUuaW5zdGFuY2lhdGVKU0RPTSA9IGZ1bmN0aW9uIChodG1sLCB1cmwsIHVpZCwgY2IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAganNkb20uZGVidWdNb2RlID0gdHJ1ZTtcbiAgICAgICAgdmFyIFVSTCA9IHRoaXMuY29uZmlnLnNlcnZlci5nZXREb21haW4oKSArIHVybDtcbiAgICAgICAgZGVidWcoJ1NFUlZFUiBVUkwgPSAnLCBVUkwpO1xuICAgICAgICB2YXIgZGVidWdWaXJ0dWFsQ29uc29sZSA9IGpzZG9tLmNyZWF0ZVZpcnR1YWxDb25zb2xlKCk7XG4gICAgICAgIGRlYnVnVmlydHVhbENvbnNvbGUub24oXCJqc2RvbUVycm9yXCIsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgQW5ndWxhclNlcnZlclJlbmRlcmVyLmV2ZW50RW1taXRlci5lbWl0KGludGVyZmFjZXNfMS5KU0RPTV9FVkVOVFMuSlNET01fRVJST1IgKyB1aWQsIGVycm9yKTtcbiAgICAgICAgICAgIGRlYnVnKCdTb21lIHNlcmlvdXMgc2hpdCBoYXBwZW5lZCcsIGVycm9yLmRldGFpbCk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIganNEb21Db25zb2xlO1xuICAgICAgICB2YXIganNEb21Db25zb2xlQ29uZmlnID0gdGhpcy5jb25maWcuc2VydmVyLmdldEpTRG9tQ29uc29sZSgpO1xuICAgICAgICBzd2l0Y2ggKGpzRG9tQ29uc29sZUNvbmZpZykge1xuICAgICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAgICAganNEb21Db25zb2xlID0gZGVidWdWaXJ0dWFsQ29uc29sZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xvZyc6XG4gICAgICAgICAgICAgICAganNEb21Db25zb2xlID0gZGVidWdWaXJ0dWFsQ29uc29sZS5zZW5kVG8oY29uc29sZSwgeyBvbWl0SnNkb21FcnJvcnM6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhbGwnOlxuICAgICAgICAgICAgICAgIGpzRG9tQ29uc29sZSA9IGRlYnVnVmlydHVhbENvbnNvbGUuc2VuZFRvKGNvbnNvbGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkb2N1bWVudCA9IGpzZG9tLmpzZG9tKGh0bWwsIHtcbiAgICAgICAgICAgIGZlYXR1cmVzOiB7XG4gICAgICAgICAgICAgICAgRmV0Y2hFeHRlcm5hbFJlc291cmNlczogWydzY3JpcHQnXSxcbiAgICAgICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IFsnc2NyaXB0J11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXNvdXJjZUxvYWRlcjogZnVuY3Rpb24gKHJlc291cmNlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5qc0RPTVJlcXVlc3RVcmwodWlkLCBbXSwgcmVzb3VyY2UsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1cmw6IFVSTCxcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlOiBqc0RvbUNvbnNvbGUsXG4gICAgICAgICAgICBkb2N1bWVudDoge1xuICAgICAgICAgICAgICAgIHJlZmVycmVyOiAnJyxcbiAgICAgICAgICAgICAgICBjb29raWU6ICdrZXk9dmFsdWU7IGV4cGlyZXM9V2VkLCBTZXAgMjEgMjAxMSAxMjowMDowMCBHTVQ7IHBhdGg9LycsXG4gICAgICAgICAgICAgICAgY29va2llRG9tYWluOiB0aGlzLmNvbmZpZy5zZXJ2ZXIuZ2V0RG9tYWluKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbiAoZXJyb3IsIHdpbmRvdykge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnQ3JlYXRlZCBldmVudCBjYXVnaHQnLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlci5ldmVudEVtbWl0ZXIuZW1pdChpbnRlcmZhY2VzXzEuSlNET01fRVZFTlRTLkpTRE9NX0NSRUFURURfRVJST1IgKyB1aWQsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZG9uZTogZnVuY3Rpb24gKGVycm9yLCB3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVidWcoJ0RvbmUgZXZlbnQgY2F1Z2h0JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBBbmd1bGFyU2VydmVyUmVuZGVyZXIuZXZlbnRFbW1pdGVyLmVtaXQoaW50ZXJmYWNlc18xLkpTRE9NX0VWRU5UUy5KU0RPTV9ET05FX0VSUk9SICsgdWlkLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY2IobnVsbCwgKE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuZGVmYXVsdFZpZXcsIHtcbiAgICAgICAgICAgIG9uU2VydmVyOiB0cnVlLFxuICAgICAgICAgICAgZnM6IGZzLFxuICAgICAgICAgICAgbG9nQ29uZmlnOiB0aGlzLmNvbmZpZy5sb2cuZ2V0Q29uZmlnKCksXG4gICAgICAgICAgICBzZXJ2ZXJEZWJ1ZzogdGhpcy5jb25maWcuc2VydmVyLmdldERlYnVnKCksXG4gICAgICAgICAgICBjbGllbnRUaW1lb3V0VmFsdWU6IDEwMFxuICAgICAgICB9KSkpO1xuICAgIH07XG4gICAgO1xuICAgIEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlci5ldmVudEVtbWl0ZXIgPSBuZXcgSlNET01FdmVudEVtaXR0ZXIoKTtcbiAgICByZXR1cm4gQW5ndWxhclNlcnZlclJlbmRlcmVyO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IEFuZ3VsYXJTZXJ2ZXJSZW5kZXJlcjtcbm1vZHVsZS5leHBvcnRzID0gQW5ndWxhclNlcnZlclJlbmRlcmVyO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9Bbmd1bGFyU2VydmVyUmVuZGVyZXIudHNcbiAqKiBtb2R1bGUgaWQgPSAwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc2RvbVwiKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwianNkb21cIlxuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuKGZ1bmN0aW9uIChOR1Jlc3BvbnNlQ29kZXMpIHtcbiAgICBOR1Jlc3BvbnNlQ29kZXNbTkdSZXNwb25zZUNvZGVzW1wiUkVOREVSRURcIl0gPSAwXSA9IFwiUkVOREVSRURcIjtcbiAgICBOR1Jlc3BvbnNlQ29kZXNbTkdSZXNwb25zZUNvZGVzW1wiUkVOREVSX0VYQ0xVREVEXCJdID0gMV0gPSBcIlJFTkRFUl9FWENMVURFRFwiO1xuICAgIE5HUmVzcG9uc2VDb2Rlc1tOR1Jlc3BvbnNlQ29kZXNbXCJBTFJFQURZX0NBQ0hFRFwiXSA9IDJdID0gXCJBTFJFQURZX0NBQ0hFRFwiO1xuICAgIE5HUmVzcG9uc2VDb2Rlc1tOR1Jlc3BvbnNlQ29kZXNbXCJTRVJWRVJfVElNRU9VVFwiXSA9IDNdID0gXCJTRVJWRVJfVElNRU9VVFwiO1xuICAgIE5HUmVzcG9uc2VDb2Rlc1tOR1Jlc3BvbnNlQ29kZXNbXCJFUlJPUl9IQU5ETEVSXCJdID0gNF0gPSBcIkVSUk9SX0hBTkRMRVJcIjtcbiAgICBOR1Jlc3BvbnNlQ29kZXNbTkdSZXNwb25zZUNvZGVzW1wiU0VSVkVSX0VSUk9SXCJdID0gNV0gPSBcIlNFUlZFUl9FUlJPUlwiO1xuICAgIE5HUmVzcG9uc2VDb2Rlc1tOR1Jlc3BvbnNlQ29kZXNbXCJKU0RPTV9FUlJPUlwiXSA9IDZdID0gXCJKU0RPTV9FUlJPUlwiO1xuICAgIE5HUmVzcG9uc2VDb2Rlc1tOR1Jlc3BvbnNlQ29kZXNbXCJKU0RPTV9VUkxfRVJST1JcIl0gPSA3XSA9IFwiSlNET01fVVJMX0VSUk9SXCI7XG4gICAgTkdSZXNwb25zZUNvZGVzW05HUmVzcG9uc2VDb2Rlc1tcIkNBQ0hFX0VOR0lORV9FUlJPUlwiXSA9IDhdID0gXCJDQUNIRV9FTkdJTkVfRVJST1JcIjtcbn0pKGV4cG9ydHMuTkdSZXNwb25zZUNvZGVzIHx8IChleHBvcnRzLk5HUmVzcG9uc2VDb2RlcyA9IHt9KSk7XG52YXIgTkdSZXNwb25zZUNvZGVzID0gZXhwb3J0cy5OR1Jlc3BvbnNlQ29kZXM7XG4oZnVuY3Rpb24gKEpTRE9NX0VWRU5UUykge1xuICAgIEpTRE9NX0VWRU5UU1tKU0RPTV9FVkVOVFNbXCJKU0RPTV9FUlJPUlwiXSA9IDBdID0gXCJKU0RPTV9FUlJPUlwiO1xuICAgIEpTRE9NX0VWRU5UU1tKU0RPTV9FVkVOVFNbXCJKU0RPTV9VUkxfRVJST1JcIl0gPSAxXSA9IFwiSlNET01fVVJMX0VSUk9SXCI7XG4gICAgSlNET01fRVZFTlRTW0pTRE9NX0VWRU5UU1tcIkpTRE9NX0NSRUFURURfRVJST1JcIl0gPSAyXSA9IFwiSlNET01fQ1JFQVRFRF9FUlJPUlwiO1xuICAgIEpTRE9NX0VWRU5UU1tKU0RPTV9FVkVOVFNbXCJKU0RPTV9ET05FX0VSUk9SXCJdID0gM10gPSBcIkpTRE9NX0RPTkVfRVJST1JcIjtcbn0pKGV4cG9ydHMuSlNET01fRVZFTlRTIHx8IChleHBvcnRzLkpTRE9NX0VWRU5UUyA9IHt9KSk7XG52YXIgSlNET01fRVZFTlRTID0gZXhwb3J0cy5KU0RPTV9FVkVOVFM7XG47XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL2ludGVyZmFjZXMudHNcbiAqKiBtb2R1bGUgaWQgPSAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBkYnVnID0gcmVxdWlyZSgnZGVidWcnKTtcbnZhciBjYWNoZV8xID0gcmVxdWlyZSgnLi9jb25maWcvY2FjaGUnKTtcbnZhciBsb2dfMSA9IHJlcXVpcmUoJy4vY29uZmlnL2xvZycpO1xudmFyIHJlbmRlcl8xID0gcmVxdWlyZSgnLi9jb25maWcvcmVuZGVyJyk7XG52YXIgc2VydmVyXzEgPSByZXF1aXJlKCcuL2NvbmZpZy9zZXJ2ZXInKTtcbnZhciBkZWJ1ZyA9IGRidWcoJ2FuZ3VsYXIuanMtc2VydmVyJyk7XG52YXIgRW5naW5lQ29uZmlnID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbmdpbmVDb25maWcoY29uZmlnLCBjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnNlcnZlciA9IG5ldyBzZXJ2ZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubG9nID0gbmV3IGxvZ18xLmRlZmF1bHQoY29uZmlnLmxvZyk7XG4gICAgICAgIHRoaXMucmVuZGVyID0gbmV3IHJlbmRlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXIuaW1wb3J0Q29uZmlnKGNvbmZpZy5zZXJ2ZXIpO1xuICAgICAgICB0aGlzLnJlbmRlci5pbXBvcnRDb25maWcoY29uZmlnLnJlbmRlcik7XG4gICAgICAgIHZhciBzZXJ2ZXJDb25maWcgPSB0aGlzLnNlcnZlci5nZXRTdG9yYWdlQ29uZmlnKCk7XG4gICAgICAgIHZhciBuYiA9IDA7XG4gICAgICAgIG5ldyBjYWNoZV8xLmRlZmF1bHQodGhpcy5zZXJ2ZXIuZ2V0RG9tYWluKCksICdTRVJWRVInLCBjb25maWcuc2VydmVyQ2FjaGUsIHNlcnZlckNvbmZpZywgZnVuY3Rpb24gKGVyciwgY2FjaGVFbmdpbmUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgX3RoaXMuY2FjaGUgPSBjYWNoZUVuZ2luZTtcbiAgICAgICAgICAgIGlmICgrK25iID09PSAzKSB7XG4gICAgICAgICAgICAgICAgY2IobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBuZXcgY2FjaGVfMS5kZWZhdWx0KHRoaXMuc2VydmVyLmdldERvbWFpbigpLCAnUkVTVCcsIGNvbmZpZy5yZXN0Q2FjaGUsIHNlcnZlckNvbmZpZywgZnVuY3Rpb24gKGVyciwgY2FjaGVFbmdpbmUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgX3RoaXMucmVzdENhY2hlID0gY2FjaGVFbmdpbmU7XG4gICAgICAgICAgICBpZiAoKytuYiA9PT0gMykge1xuICAgICAgICAgICAgICAgIGNiKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbmV3IGNhY2hlXzEuZGVmYXVsdCh0aGlzLnNlcnZlci5nZXREb21haW4oKSwgJ0pTRE9NJywgY29uZmlnLmpzZG9tQ2FjaGUsIHNlcnZlckNvbmZpZywgZnVuY3Rpb24gKGVyciwgY2FjaGVFbmdpbmUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgX3RoaXMuanNkb21DYWNoZSA9IGNhY2hlRW5naW5lO1xuICAgICAgICAgICAgaWYgKCsrbmIgPT09IDMpIHtcbiAgICAgICAgICAgICAgICBjYihudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBFbmdpbmVDb25maWc7XG59KCkpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gRW5naW5lQ29uZmlnO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9FbmdpbmVDb25maWcudHNcbiAqKiBtb2R1bGUgaWQgPSAzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJkZWJ1Z1wiKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwiZGVidWdcIlxuICoqIG1vZHVsZSBpZCA9IDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xudmFyIHJlZGlzX3VybF9jYWNoZV8xID0gcmVxdWlyZSgncmVkaXMtdXJsLWNhY2hlJyk7XG52YXIgZGJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJyk7XG52YXIgZGVidWcgPSBkYnVnKCdhbmd1bGFyLmpzLXNlcnZlcicpO1xudmFyIENhY2hlQ29uZmlnID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWNoZUNvbmZpZyhkb21haW4sIGluc3RhbmNlTmFtZSwgcnVsZXMsIHN0b3JhZ2VDb25maWcsIGNiKSB7XG4gICAgICAgIGRlYnVnKCdidWlsZGluZyBDYWNoZUNvbmZpZycsIGRvbWFpbiwgcnVsZXMpO1xuICAgICAgICBuZXcgcmVkaXNfdXJsX2NhY2hlXzEuQ2FjaGVSdWxlc0NyZWF0b3IoaW5zdGFuY2VOYW1lLCBzdG9yYWdlQ29uZmlnLCBmdW5jdGlvbiAoZXJyLCBjcmVhdG9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgY3JlYXRvci5pbXBvcnRSdWxlcyhydWxlcywgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0EgQ2FjaGVSdWxlIGRlZmluaXRpb24gYWxyZWFkeSBleGlzdHMgZm9yIHRoaXMgaW5zdGFuY2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgcmVkaXNfdXJsX2NhY2hlXzEuSW5zdGFuY2UoaW5zdGFuY2VOYW1lLCBzdG9yYWdlQ29uZmlnLCB7fSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICAgICAgICAgIGNiKG51bGwsIG5ldyByZWRpc191cmxfY2FjaGVfMS5DYWNoZUVuZ2luZUNCKGRvbWFpbiwgaW5zdGFuY2UpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgQ2FjaGVDb25maWcucHJvdG90eXBlLmdldENhY2hlRW5naW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZTtcbiAgICB9O1xuICAgIHJldHVybiBDYWNoZUNvbmZpZztcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBDYWNoZUNvbmZpZztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvY29uZmlnL2NhY2hlLnRzXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVkaXMtdXJsLWNhY2hlXCIpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJyZWRpcy11cmwtY2FjaGVcIlxuICoqIG1vZHVsZSBpZCA9IDZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xudmFyIEhlbHBlcnNfMSA9IHJlcXVpcmUoJy4vLi4vSGVscGVycycpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xudmFyIGRidWcgPSByZXF1aXJlKCdkZWJ1ZycpO1xudmFyIGRlYnVnID0gZGJ1ZygnYW5ndWxhci5qcy1zZXJ2ZXInKTtcbnZhciBMb2dDb25maWcgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIExvZ0NvbmZpZyhjb25maWcpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5sb2dDb25maWcgPSB7XG4gICAgICAgICAgICBkaXI6IHBhdGgucmVzb2x2ZShwcm9jZXNzLmVudlsocHJvY2Vzcy5wbGF0Zm9ybSA9PSAnd2luMzInKSA/ICdVU0VSUFJPRklMRScgOiAnSE9NRSddICsgJy9sb2cvYW5ndWxhci5qcy1zZXJ2ZXInKSxcbiAgICAgICAgICAgIGxvZzogeyBlbmFibGVkOiB0cnVlLCBzdGFjazogZmFsc2UgfSxcbiAgICAgICAgICAgIGVycm9yOiB7IGVuYWJsZWQ6IHRydWUsIHN0YWNrOiBmYWxzZSB9LFxuICAgICAgICAgICAgd2FybjogeyBlbmFibGVkOiB0cnVlLCBzdGFjazogZmFsc2UgfSxcbiAgICAgICAgICAgIGluZm86IHsgZW5hYmxlZDogdHJ1ZSwgc3RhY2s6IGZhbHNlIH0sXG4gICAgICAgICAgICBkZWJ1ZzogeyBlbmFibGVkOiB0cnVlLCBzdGFjazogZmFsc2UgfSxcbiAgICAgICAgICAgIHNlcnZlckxvZ0ZpbGU6ICdhbmd1bGFyLXNlcnZlci5sb2cnXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29uZmlnSW5zdGFuY2lhdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2V0QmFzZVBhdGggPSBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICAgICAgSGVscGVyc18xLmRlZmF1bHQuQ2hlY2tUeXBlKHBhdGgsICdzdHJpbmcnKTtcbiAgICAgICAgICAgIF90aGlzLmxvZ0NvbmZpZy5kaXIgPSBwYXRoO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldERlZmluaXRpb24gPSBmdW5jdGlvbiAobG9nLCBlbmFibGVkLCBzdGFjaykge1xuICAgICAgICAgICAgSGVscGVyc18xLmRlZmF1bHQuQ2hlY2tUeXBlKGxvZywgJ3N0cmluZycpO1xuICAgICAgICAgICAgSGVscGVyc18xLmRlZmF1bHQuQ2hlY2tUeXBlKGVuYWJsZWQsICdib29sZWFuJyk7XG4gICAgICAgICAgICBfdGhpcy5sb2dDb25maWdbbG9nXS5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgICAgIF90aGlzLmxvZ0NvbmZpZ1tsb2ddLnN0YWNrID0gc3RhY2sgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0RmlsZVNlcnZlck5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgSGVscGVyc18xLmRlZmF1bHQuQ2hlY2tUeXBlKG5hbWUsICdzdHJpbmcnKTtcbiAgICAgICAgICAgIF90aGlzLmxvZ0NvbmZpZy5zZXJ2ZXJMb2dGaWxlID0gbmFtZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRCYXNlUGF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5sb2dDb25maWcuZGlyO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldERlZmluaXRpb24gPSBmdW5jdGlvbiAobG9nKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMubG9nQ29uZmlnW2xvZ107XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0RmlsZVNlcnZlck5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMubG9nQ29uZmlnLnNlcnZlckxvZ0ZpbGU7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0TG9nUGF0aCA9IGZ1bmN0aW9uIChsb2cpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4oX3RoaXMubG9nQ29uZmlnLmRpciwgbG9nICsgJy5sb2cnKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRMb2dTZXJ2ZXJQYXRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGguam9pbihfdGhpcy5sb2dDb25maWcuZGlyLCBfdGhpcy5sb2dDb25maWcuc2VydmVyTG9nRmlsZSArICcubG9nJyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q29uZmlnID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmxvZ0NvbmZpZztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5sb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICBhcmdzW19pIC0gMF0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnMuYXBwZW5kRmlsZVN5bmMoX3RoaXMuZ2V0TG9nU2VydmVyUGF0aCgpLCBhcmdzLmpvaW4oJywgJykgKyAnXFxuJyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0QmFzZVBhdGgoY29uZmlnLmRpcik7XG4gICAgICAgIFsnbG9nJywgJ3dhcm4nLCAnZXJyb3InLCAnaW5mbycsICdkZWJ1ZyddLmZvckVhY2goZnVuY3Rpb24gKGxvZykge1xuICAgICAgICAgICAgX3RoaXMuc2V0RGVmaW5pdGlvbihsb2csIGNvbmZpZ1tsb2ddLmVuYWJsZWQsIGNvbmZpZ1tsb2ddLnN0YWNrKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0RmlsZVNlcnZlck5hbWUoY29uZmlnLnNlcnZlckxvZ0ZpbGUpO1xuICAgICAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG4gICAgTG9nQ29uZmlnLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmxvZ0NvbmZpZy5kaXIgPSBwYXRoLnJlc29sdmUocGF0aC5ub3JtYWxpemUodGhpcy5sb2dDb25maWcuZGlyKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5ta2RpcnNTeW5jKHRoaXMubG9nQ29uZmlnLmRpcik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIEhlbHBlcnNfMS5kZWZhdWx0LkVycm9yKFwiY2FuJ3QgY3JlYXRlIHRoZSBsb2cgZGlyXCIsIHRoaXMubG9nQ29uZmlnLmRpciwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhdGhzID0gW107XG4gICAgICAgIFsnd2FybicsICdsb2cnLCAnZGVidWcnLCAnZXJyb3InLCAnaW5mbyddLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5sb2dDb25maWdbaXRlbV0uZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHBhdGhzLnB1c2goX3RoaXMuZ2V0TG9nUGF0aChpdGVtKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYXRocy5wdXNoKHBhdGgucmVzb2x2ZShwYXRoLmpvaW4odGhpcy5sb2dDb25maWcuZGlyLCAnZGV2LmxvZycpKSk7XG4gICAgICAgIHBhdGhzLnB1c2godGhpcy5nZXRMb2dTZXJ2ZXJQYXRoKCkpO1xuICAgICAgICBwYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZzLmNsb3NlU3luYyhmcy5vcGVuU3luYyhwYXRoLCAnYScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgSGVscGVyc18xLmRlZmF1bHQuRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgO1xuICAgIHJldHVybiBMb2dDb25maWc7XG59KCkpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gTG9nQ29uZmlnO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9jb25maWcvbG9nLnRzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgbm9kZXVybCA9IHJlcXVpcmUoJ3VybCcpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnYW5ndWxhci5qcy1zZXJ2ZXInKTtcbnZhciBIZWxwZXJzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIZWxwZXJzKCkge1xuICAgIH1cbiAgICBIZWxwZXJzLkVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgYXJnc1tfaSAtIDBdID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYXJncy5qb2luKCcsICcpKTtcbiAgICB9O1xuICAgIEhlbHBlcnMuU2FtZVJlZ2V4ID0gZnVuY3Rpb24gKHIxLCByMikge1xuICAgICAgICBkZWJ1ZygnY2hlY2tpbmcgaWYgcnVsZXMgYXJlIHRoZSBzYW1lJywgcjEsIHIyKTtcbiAgICAgICAgaWYgKHIxIGluc3RhbmNlb2YgUmVnRXhwICYmIHIyIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBbXCJnbG9iYWxcIiwgXCJtdWx0aWxpbmVcIiwgXCJpZ25vcmVDYXNlXCIsIFwic291cmNlXCJdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHIxW3Byb3BdICE9PSByMltwcm9wXSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZygncHJvcHMgZGlmZicsIHByb3AsIHIxW3Byb3BdLCByMltwcm9wXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBIZWxwZXJzLkNoZWNrSG9zdG5hbWUgPSBmdW5jdGlvbiAoZG9tYWluKSB7XG4gICAgICAgIEhlbHBlcnMuQ2hlY2tUeXBlKGRvbWFpbiwgJ3N0cmluZycpO1xuICAgICAgICB2YXIgcGFyc2VkVVJMID0gbm9kZXVybC5wYXJzZShkb21haW4pO1xuICAgICAgICBwYXJzZWRVUkwucGF0aG5hbWUgPSBudWxsO1xuICAgICAgICBwYXJzZWRVUkwucGF0aCA9IG51bGw7XG4gICAgICAgIHBhcnNlZFVSTC5oYXNoID0gbnVsbDtcbiAgICAgICAgcGFyc2VkVVJMLnF1ZXJ5ID0gbnVsbDtcbiAgICAgICAgcGFyc2VkVVJMLnNlYXJjaCA9IG51bGw7XG4gICAgICAgIHZhciBmb3JtYXR0ZWREbWFpbiA9IG5vZGV1cmwuZm9ybWF0KHBhcnNlZFVSTCk7XG4gICAgICAgIGRlYnVnKCdDaGVja2luZyBkb21haW4gJywgZG9tYWluLCBmb3JtYXR0ZWREbWFpbik7XG4gICAgICAgIGlmIChmb3JtYXR0ZWREbWFpbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIEhlbHBlcnMuRXJyb3IoJ0ludmFsaWQgZG9tYWluIG5hbWUgcHJvdmlkZWQnLCBkb21haW4sIGZvcm1hdHRlZERtYWluKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZXVybC5wYXJzZShmb3JtYXR0ZWREbWFpbik7XG4gICAgfTtcbiAgICBIZWxwZXJzLkNoZWNrVHlwZSA9IGZ1bmN0aW9uIChpbnB1dCwgdHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiBpbnB1dC5jb25zdHJ1Y3RvciAhPT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIEhlbHBlcnMuRXJyb3IoJ1RoaXMgaW5wdXQgaXMgbm90IGEgdmFsaWQnLCB0eXBlLCBpbnB1dCwgJyB0eXBlIGlzJywgaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0eXBlLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LmNvbnN0cnVjdG9yID09PSBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIEhlbHBlcnMuRXJyb3IoaW5wdXQsICdEb2VzblxcJ3QgbWF0Y2ggYW55IG9mIHRoZXNlIHR5cGVzJywgdHlwZSwgJyBnb3QgJywgaW5wdXQuY29uc3RydWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGlucHV0ICE9PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgSGVscGVycy5FcnJvcignVGhpcyBpbnB1dCBpcyBub3QgYSB2YWxpZCcsIHR5cGUsIGlucHV0LCAnIHR5cGUgaXMnLCB0eXBlb2YgaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0eXBlLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgICAgICBIZWxwZXJzLkVycm9yKGlucHV0LCAnRG9lc25cXCd0IG1hdGNoIGFueSBvZiB0aGVzZSB0eXBlcycsIHR5cGUsICcgZ290ICcsIHR5cGVvZiBpbnB1dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBIZWxwZXJzLlN0cmluZ0luID0gZnVuY3Rpb24gKGlucHV0LCB2YWxpZFZhbHVlcykge1xuICAgICAgICBIZWxwZXJzLkNoZWNrVHlwZShpbnB1dCwgJ3N0cmluZycpO1xuICAgICAgICBpZiAodmFsaWRWYWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZhbGlkID0gZmFsc2U7XG4gICAgICAgIHZhbGlkVmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChpdGVtID09PSBpbnB1dCkge1xuICAgICAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgIEhlbHBlcnMuRXJyb3IoaW5wdXQsICdzaG91bGQgbWF0Y2gnLCB2YWxpZFZhbHVlcyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEhlbHBlcnMuUmVnZXhOb3RJbiA9IGZ1bmN0aW9uIChyZWdleCwgcmVnZXhlcywgZGVzYykge1xuICAgICAgICBpZiAocmVnZXhlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBIZWxwZXJzLkNoZWNrVHlwZShyZWdleCwgUmVnRXhwKTtcbiAgICAgICAgcmVnZXhlcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBpZiAoSGVscGVycy5TYW1lUmVnZXgoaXRlbSwgcmVnZXgpKSB7XG4gICAgICAgICAgICAgICAgSGVscGVycy5FcnJvcihpdGVtLCAnIElzIGFscmVhZHkgZGVmaW5lZCAnLCBkZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gSGVscGVycztcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBIZWxwZXJzO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9IZWxwZXJzLnRzXG4gKiogbW9kdWxlIGlkID0gOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXJsXCIpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwgXCJ1cmxcIlxuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcInBhdGhcIlxuICoqIG1vZHVsZSBpZCA9IDEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmcy1leHRyYVwiKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwiZnMtZXh0cmFcIlxuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBIZWxwZXJzXzEgPSByZXF1aXJlKCcuLy4uL0hlbHBlcnMnKTtcbnZhciBkYnVnID0gcmVxdWlyZSgnZGVidWcnKTtcbnZhciBkZWJ1ZyA9IGRidWcoJ2FuZ3VsYXIuanMtc2VydmVyJyk7XG52YXIgUmVuZGVyQ29uZmlnID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBSZW5kZXJDb25maWcoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyQ29uZmlnID0ge1xuICAgICAgICAgICAgc3RyYXRlZ3k6ICduZXZlcicsXG4gICAgICAgICAgICBydWxlczogW11cbiAgICAgICAgfTtcbiAgICB9XG4gICAgUmVuZGVyQ29uZmlnLnByb3RvdHlwZS5pbXBvcnRDb25maWcgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuc2V0U3RyYXRlZ3koY29uZmlnLnN0cmF0ZWd5KTtcbiAgICAgICAgY29uZmlnLnJ1bGVzLmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICAgICAgICAgIF90aGlzLmFkZFJ1bGUocnVsZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgUmVuZGVyQ29uZmlnLnByb3RvdHlwZS5zaG91bGRSZW5kZXIgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHZhciBpLCByZWdleDtcbiAgICAgICAgSGVscGVyc18xLmRlZmF1bHQuQ2hlY2tUeXBlKHVybCwgJ3N0cmluZycpO1xuICAgICAgICBkZWJ1Zygnc2hvdWxkUmVuZGVyIGNhbGxlZCB3aXRoIHVybCwgcmVuZGVyQ29uZmlnICcsIHVybCwgdGhpcy5yZW5kZXJDb25maWcpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMucmVuZGVyQ29uZmlnLnN0cmF0ZWd5KSB7XG4gICAgICAgICAgICBjYXNlICduZXZlcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY2FzZSAnYWx3YXlzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgJ2luY2x1ZGUnOlxuICAgICAgICAgICAgICAgIGZvciAoaSBpbiB0aGlzLnJlbmRlckNvbmZpZy5ydWxlcykge1xuICAgICAgICAgICAgICAgICAgICByZWdleCA9IHRoaXMucmVuZGVyQ29uZmlnLnJ1bGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVnZXgudGVzdCh1cmwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjYXNlICdleGNsdWRlJzpcbiAgICAgICAgICAgICAgICBmb3IgKGkgaW4gdGhpcy5yZW5kZXJDb25maWcucnVsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVnZXggPSB0aGlzLnJlbmRlckNvbmZpZy5ydWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZ2V4LnRlc3QodXJsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICA7XG4gICAgUmVuZGVyQ29uZmlnLnByb3RvdHlwZS5zZXRTdHJhdGVneSA9IGZ1bmN0aW9uIChzdHJhdGVneSkge1xuICAgICAgICBIZWxwZXJzXzEuZGVmYXVsdC5TdHJpbmdJbihzdHJhdGVneSwgWydpbmNsdWRlJywgJ2V4Y2x1ZGUnLCAnYWx3YXlzJywgJ25ldmVyJ10pO1xuICAgICAgICB0aGlzLnJlbmRlckNvbmZpZy5zdHJhdGVneSA9IHN0cmF0ZWd5O1xuICAgIH07XG4gICAgO1xuICAgIFJlbmRlckNvbmZpZy5wcm90b3R5cGUuYWRkUnVsZSA9IGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICAgIEhlbHBlcnNfMS5kZWZhdWx0LkNoZWNrVHlwZShydWxlLCBSZWdFeHApO1xuICAgICAgICBIZWxwZXJzXzEuZGVmYXVsdC5SZWdleE5vdEluKHJ1bGUsIHRoaXMucmVuZGVyQ29uZmlnLnJ1bGVzKTtcbiAgICAgICAgdGhpcy5yZW5kZXJDb25maWcucnVsZXMucHVzaChydWxlKTtcbiAgICB9O1xuICAgIDtcbiAgICBSZW5kZXJDb25maWcucHJvdG90eXBlLnJlbW92ZVJ1bGUgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICBIZWxwZXJzXzEuZGVmYXVsdC5DaGVja1R5cGUocnVsZSwgUmVnRXhwKTtcbiAgICAgICAgdmFyIGluZGV4ID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLnJlbmRlckNvbmZpZy5ydWxlcykge1xuICAgICAgICAgICAgaWYgKEhlbHBlcnNfMS5kZWZhdWx0LlNhbWVSZWdleCh0aGlzLnJlbmRlckNvbmZpZy5ydWxlc1tpXSwgcnVsZSkpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckNvbmZpZy5ydWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICA7XG4gICAgUmVuZGVyQ29uZmlnLnByb3RvdHlwZS5nZXRTdHJhdGVneSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyQ29uZmlnLnN0cmF0ZWd5O1xuICAgIH07XG4gICAgO1xuICAgIFJlbmRlckNvbmZpZy5wcm90b3R5cGUuZ2V0UnVsZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlckNvbmZpZy5ydWxlcztcbiAgICB9O1xuICAgIDtcbiAgICBSZW5kZXJDb25maWcucHJvdG90eXBlLmhhc1J1bGUgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICBIZWxwZXJzXzEuZGVmYXVsdC5DaGVja1R5cGUocnVsZSwgUmVnRXhwKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLnJlbmRlckNvbmZpZy5ydWxlcykge1xuICAgICAgICAgICAgaWYgKEhlbHBlcnNfMS5kZWZhdWx0LlNhbWVSZWdleCh0aGlzLnJlbmRlckNvbmZpZy5ydWxlc1tpXSwgcnVsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICA7XG4gICAgcmV0dXJuIFJlbmRlckNvbmZpZztcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBSZW5kZXJDb25maWc7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL2NvbmZpZy9yZW5kZXIudHNcbiAqKiBtb2R1bGUgaWQgPSAxMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgSGVscGVyc18xID0gcmVxdWlyZSgnLi8uLi9IZWxwZXJzJyk7XG52YXIgZGJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJyk7XG52YXIgbm9kZXVybCA9IHJlcXVpcmUoJ3VybCcpO1xudmFyIGRlYnVnID0gZGJ1ZygnYW5ndWxhci5qcy1zZXJ2ZXInKTtcbnZhciBTZXJ2ZXJDb25maWcgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlcnZlckNvbmZpZygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5zZXREb21haW4gPSBmdW5jdGlvbiAoZG9tYWluKSB7XG4gICAgICAgICAgICB2YXIgcGFyc2VkVXJsID0gbm9kZXVybC5wYXJzZShkb21haW4pO1xuICAgICAgICAgICAgdmFyIHVybCA9IEhlbHBlcnNfMS5kZWZhdWx0LkNoZWNrSG9zdG5hbWUoZG9tYWluKTtcbiAgICAgICAgICAgIHVybC5wYXRobmFtZSA9IG51bGw7XG4gICAgICAgICAgICB1cmwuaGFzaCA9IG51bGw7XG4gICAgICAgICAgICB1cmwuc2VhcmNoID0gbnVsbDtcbiAgICAgICAgICAgIHVybC5xdWVyeSA9IG51bGw7XG4gICAgICAgICAgICB1cmwucGF0aCA9IG51bGw7XG4gICAgICAgICAgICBfdGhpcy5zZXJ2ZXJDb25maWcuZG9tYWluID0gbm9kZXVybC5mb3JtYXQodXJsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gKHRpbWVvdXQpIHtcbiAgICAgICAgICAgIEhlbHBlcnNfMS5kZWZhdWx0LkNoZWNrVHlwZSh0aW1lb3V0LCAnbnVtYmVyJyk7XG4gICAgICAgICAgICBfdGhpcy5zZXJ2ZXJDb25maWcudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0RGVidWcgPSBmdW5jdGlvbiAoZGVidWcpIHtcbiAgICAgICAgICAgIEhlbHBlcnNfMS5kZWZhdWx0LkNoZWNrVHlwZShkZWJ1ZywgJ2Jvb2xlYW4nKTtcbiAgICAgICAgICAgIF90aGlzLnNlcnZlckNvbmZpZy5kZWJ1ZyA9IGRlYnVnO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldEJhc2UgPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgICAgICAgICAgSGVscGVyc18xLmRlZmF1bHQuQ2hlY2tUeXBlKGJhc2UsICdzdHJpbmcnKTtcbiAgICAgICAgICAgIF90aGlzLnNlcnZlckNvbmZpZy5iYXNlID0gYmFzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXREb21haW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuc2VydmVyQ29uZmlnLmRvbWFpbjtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNlcnZlckNvbmZpZy50aW1lb3V0ICogMTAwMDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXREZWJ1ZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5zZXJ2ZXJDb25maWcuZGVidWc7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0QmFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5zZXJ2ZXJDb25maWcuYmFzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN0b3JhZ2VDb25maWcgPSB7XG4gICAgICAgICAgICBcImhvc3RcIjogXCIxMjcuMC4wLjFcIixcbiAgICAgICAgICAgIFwicG9ydFwiOiA2Mzc5LFxuICAgICAgICAgICAgXCJzb2NrZXRfa2VlcGFsaXZlXCI6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJDb25maWcgPSB7XG4gICAgICAgICAgICBkb21haW46ICdodHRwOi8vbG9jYWxob3N0JyxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgICAgZGVidWc6IHRydWUsXG4gICAgICAgICAgICBiYXNlOiAnLycsXG4gICAgICAgICAgICBqc2RvbUNvbnNvbGU6ICdsb2cnLFxuICAgICAgICAgICAgc3RvcmFnZUNvbmZpZzogc3RvcmFnZUNvbmZpZ1xuICAgICAgICB9O1xuICAgIH1cbiAgICBTZXJ2ZXJDb25maWcucHJvdG90eXBlLmltcG9ydENvbmZpZyA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgdGhpcy5zZXREb21haW4oY29uZmlnLmRvbWFpbik7XG4gICAgICAgIHRoaXMuc2V0VGltZW91dChjb25maWcudGltZW91dCk7XG4gICAgICAgIHRoaXMuc2V0RGVidWcoY29uZmlnLmRlYnVnKTtcbiAgICAgICAgdGhpcy5zZXRCYXNlKGNvbmZpZy5iYXNlKTtcbiAgICAgICAgdGhpcy5zZXRKU0RvbUNPbnNvbGUoY29uZmlnLmpzZG9tQ29uc29sZSk7XG4gICAgICAgIHRoaXMuc2V0U3RvcmFnZUNvbmZpZyhjb25maWcuc3RvcmFnZUNvbmZpZyk7XG4gICAgfTtcbiAgICBTZXJ2ZXJDb25maWcucHJvdG90eXBlLnNldFN0b3JhZ2VDb25maWcgPSBmdW5jdGlvbiAoc3RvcmFnZUNvbmZpZykge1xuICAgICAgICB0aGlzLnNlcnZlckNvbmZpZy5zdG9yYWdlQ29uZmlnID0gc3RvcmFnZUNvbmZpZztcbiAgICB9O1xuICAgIFNlcnZlckNvbmZpZy5wcm90b3R5cGUuc2V0SlNEb21DT25zb2xlID0gZnVuY3Rpb24gKGpzZG9tQ29uc29sZSkge1xuICAgICAgICB0aGlzLnNlcnZlckNvbmZpZy5qc2RvbUNvbnNvbGUgPSBqc2RvbUNvbnNvbGU7XG4gICAgfTtcbiAgICBTZXJ2ZXJDb25maWcucHJvdG90eXBlLmdldFN0b3JhZ2VDb25maWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZlckNvbmZpZy5zdG9yYWdlQ29uZmlnO1xuICAgIH07XG4gICAgU2VydmVyQ29uZmlnLnByb3RvdHlwZS5nZXRKU0RvbUNvbnNvbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZlckNvbmZpZy5qc2RvbUNvbnNvbGU7XG4gICAgfTtcbiAgICByZXR1cm4gU2VydmVyQ29uZmlnO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFNlcnZlckNvbmZpZztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvY29uZmlnL3NlcnZlci50c1xuICoqIG1vZHVsZSBpZCA9IDEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwiZnNcIlxuICoqIG1vZHVsZSBpZCA9IDE0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJzb3VyY2UtbWFwLXN1cHBvcnRcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcInNvdXJjZS1tYXAtc3VwcG9ydFwiXG4gKiogbW9kdWxlIGlkID0gMTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlcXVlc3RcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcInJlcXVlc3RcIlxuICoqIG1vZHVsZSBpZCA9IDE2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudHNcIik7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCBcImV2ZW50c1wiXG4gKiogbW9kdWxlIGlkID0gMTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGUtdXVpZFwiKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIGV4dGVybmFsIFwibm9kZS11dWlkXCJcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==