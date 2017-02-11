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
	var path = __webpack_require__(1);
	var fs = __webpack_require__(2);
	var async = __webpack_require__(3);
	var yaml = __webpack_require__(4);
	var redis_url_cache_1 = __webpack_require__(5);
	var serverLog_1 = __webpack_require__(6);
	var cdn_server_1 = __webpack_require__(10);
	var bridge_1 = __webpack_require__(11);
	var debug = __webpack_require__(9)('ngServer');
	var MasterProcess = (function () {
	    function MasterProcess(configDir) {
	        this.configDir = configDir;
	        debug('DIRNAME = ', __dirname);
	        if (!fs.existsSync(configDir)) {
	            throw "The config dir doesn't exists " + configDir;
	        }
	        var configPath;
	        ['serverConfig.yml', 'serverRenderRules.yml', 'serverCacheRules.yml', 'slimerRestCacheRules.yml'].forEach(function (item) {
	            configPath = path.join(configDir, item);
	            if (!fs.existsSync(configPath)) {
	                throw new Error('The config file ' + configPath + ' doesnt exists');
	            }
	            yaml.load(fs.readFileSync(configPath, 'utf8'));
	        });
	        this.serverConfig = yaml.load(fs.readFileSync(path.join(this.configDir, 'serverConfig.yml'), 'utf8'));
	        debug('serverConfig  ', this.serverConfig);
	        serverLog_1.default.initLogs(this.serverConfig.logBasePath, this.serverConfig.gelf);
	        serverLog_1.default.Log.info('Master starting');
	    }
	    MasterProcess.prototype.start = function (cb) {
	        var _this = this;
	        var slimerRestCacheModulePath = path.join(this.configDir, 'slimerRestCacheRules.yml');
	        var cacheRules = {
	            Slimer_Rest: redis_url_cache_1.CacheEngineCB.helpers.unserializeCacheRules(yaml.load(fs.readFileSync(slimerRestCacheModulePath, 'utf8')))
	        };
	        var parrallelFns = {};
	        for (var key in cacheRules) {
	            parrallelFns[key] = function (cb) {
	                redis_url_cache_1.CacheCreator.createCache(key.toUpperCase(), true, _this.serverConfig.redisConfig, cacheRules[key], function (err) {
	                    if (err)
	                        return cb(err);
	                    cb(null);
	                });
	            };
	        }
	        debug('Starting');
	        async.parallel(parrallelFns, function (err) {
	            if (err) {
	                return cb(err);
	            }
	            else {
	                _this.bridge = new bridge_1.default(_this.configDir);
	                _this.bridge.start(function (err) {
	                    if (err)
	                        return cb(err);
	                    _this.launchCDNServer(function (err) {
	                        if (err)
	                            return cb(err);
	                        cb();
	                    });
	                });
	            }
	        });
	    };
	    MasterProcess.prototype.stop = function (cb) {
	        var _this = this;
	        this.bridge.stop(function () {
	            _this.cdnServer.stop(function (err) {
	                if (err)
	                    return cb(err);
	                cb();
	            });
	        });
	    };
	    MasterProcess.prototype.launchCDNServer = function (cb) {
	        var cacheRules = redis_url_cache_1.CacheEngineCB.helpers.unserializeCacheRules(yaml.load(fs.readFileSync(path.join(this.configDir, 'slimerRestCacheRules.yml'), 'utf8')));
	        var cdnConfig = {
	            defaultDomain: this.serverConfig.domain,
	            port: this.serverConfig.socketServers.proxy.port,
	            instanceName: 'SLIMER_REST',
	            redisConfig: this.serverConfig.redisConfig,
	            cacheRules: cacheRules
	        };
	        this.cdnServer = new cdn_server_1.CacheServer(cdnConfig, serverLog_1.default.Log.child({
	            script: 'CacheServer'
	        }));
	        this.cdnServer.start(cb);
	    };
	    return MasterProcess;
	}());
	module.exports = MasterProcess;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("fs-extra");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("async");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("js-yaml");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("redis-url-cache");

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var bunyan = __webpack_require__(7);
	var path = __webpack_require__(1);
	var fs = __webpack_require__(2);
	var gelfStream = __webpack_require__(8);
	var debug = __webpack_require__(9)('ngServer-serverLog');
	var ServerLog = (function () {
	    function ServerLog() {
	    }
	    ServerLog.poolSerializer = function (elem) {
	        return {
	            query: elem.query,
	            status: elem.status,
	            benchmark: elem.benchmark,
	            spawner: typeof elem.spawner !== 'undefined' ? elem.spawner.getSpawner() : null
	        };
	    };
	    ServerLog.initLogs = function (basePath, gelf) {
	        var logPath = basePath;
	        try {
	            fs.ensureDirSync(logPath);
	            fs.chmodSync(logPath, '777');
	            debug(logPath + " is used to store log Files");
	        }
	        catch (e) {
	            debug("CANNOT create log " + logPath);
	            logPath = path.join(__dirname, basePath);
	            try {
	                fs.ensureDirSync(logPath);
	                fs.chmodSync(logPath, '777');
	                debug(logPath + " is used to store log Files");
	            }
	            catch (e) {
	                debug(e);
	                debug("CANNOT create log " + logPath);
	                throw new Error(e);
	            }
	        }
	        var appStreams = [
	            {
	                level: 'trace',
	                path: path.join(logPath, 'trace.log')
	            },
	            {
	                level: 'info',
	                path: path.join(logPath, 'info.log')
	            },
	            {
	                level: 'error',
	                path: path.join(logPath, 'error.log')
	            }
	        ];
	        var webAppStreams = [
	            {
	                level: 'trace',
	                path: path.join(logPath, 'web-app.log')
	            },
	            {
	                level: 'error',
	                path: path.join(logPath, 'web-app-error.log')
	            }
	        ];
	        if (gelf.enabled) {
	            var stream = gelfStream.forBunyan(gelf.host, gelf.port);
	            appStreams.push({
	                stream: stream,
	                type: 'raw',
	                level: 'trace'
	            });
	            webAppStreams.push({
	                stream: stream,
	                type: 'raw',
	                level: 'trace'
	            });
	        }
	        ServerLog.Log = bunyan.createLogger({
	            name: 'ServerLog',
	            streams: appStreams,
	            serializers: bunyan.stdSerializers
	        });
	        ServerLog.Log.addSerializers({
	            pool: ServerLog.poolSerializer
	        });
	        ServerLog.WebAppLog = bunyan.createLogger({
	            name: "WebApp",
	            streams: webAppStreams,
	            serializers: bunyan.stdSerializers
	        });
	        ServerLog.WebAppLog.addSerializers({
	            pool: ServerLog.poolSerializer
	        });
	    };
	    return ServerLog;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ServerLog;


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("bunyan");

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("gelf-stream");

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("debug");

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("cdn-server");

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var bridge_S1_1 = __webpack_require__(12);
	var bridge_S2_1 = __webpack_require__(22);
	var bridge_Pool_1 = __webpack_require__(14);
	var cache_1 = __webpack_require__(24);
	var serverLog_1 = __webpack_require__(6);
	var path = __webpack_require__(1);
	var yaml = __webpack_require__(4);
	var fs = __webpack_require__(2);
	var Bridge = (function () {
	    function Bridge(configDir) {
	        this.configDir = configDir;
	        var serverConfigpath = path.join(configDir, 'serverConfig.yml');
	        this.serverConfig = yaml.load(fs.readFileSync(serverConfigpath, 'utf8'));
	        bridge_Pool_1.default.init(this.serverConfig);
	        serverLog_1.default.initLogs(this.serverConfig.logBasePath, this.serverConfig.gelf);
	    }
	    Bridge.prototype.start = function (cb) {
	        var _this = this;
	        var logger = serverLog_1.default.Log.child({ script: 'Bridge' });
	        var cache = new cache_1.Cache(this.configDir, function (err) {
	            if (err) {
	                if (typeof err === 'string') {
	                    logger.error(new Error(err));
	                }
	                else {
	                    logger.error(err);
	                }
	                throw err;
	            }
	            ;
	            try {
	                _this.Bridge_S1 = new bridge_S1_1.default(_this.serverConfig.socketServers.bridge_external.port, cache);
	                _this.Bridge_S2 = new bridge_S2_1.default(_this.serverConfig.socketServers.bridge_internal.port);
	                _this.Bridge_S2.preboot = _this.serverConfig.preboot;
	                cb();
	            }
	            catch (e) {
	                logger.error(e);
	                cb(e);
	            }
	        });
	    };
	    Bridge.prototype.stop = function (cb) {
	        this.Bridge_S1.stop();
	        this.Bridge_S2.stop(cb);
	    };
	    return Bridge;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Bridge;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var io = __webpack_require__(13);
	var bridge_Pool_1 = __webpack_require__(14);
	var MESSAGES_1 = __webpack_require__(16);
	var fs = __webpack_require__(20);
	var tmp = __webpack_require__(21);
	var serverLog_1 = __webpack_require__(6);
	var debug = __webpack_require__(9)('ngServer-Bridge_external');
	var Bridge_S1 = (function () {
	    function Bridge_S1(port, cache) {
	        var _this = this;
	        this.cache = cache;
	        debug('going to listen to port', port);
	        this.server = io.listen(port, {
	            allowRequest: function (handshake, cb) {
	                cb(null, true);
	            }
	        });
	        this.server.on('connection', function (socket) {
	            debug('Bridge_S1 new connection ', socket.id);
	            Bridge_S1.sockets[socket.id] = socket;
	            var logger = serverLog_1.default.Log.child({
	                script: 'Bridge_S1'
	            });
	            socket.on(MESSAGES_1.MSG.GET_URL, function (query) {
	                if (query.html && query.html.length > 0) {
	                    query.tmp = _this.createTmpFile(query.html);
	                    delete query.html;
	                }
	                debug('Bridge_S1 on.AAA_MSG.GET_URL', query);
	                logger.debug({
	                    query: query
	                }, 'Bridge_S1 on.AAA_MSG.GET_URL');
	                bridge_Pool_1.default.addRender(socket.id, query);
	            });
	            socket.on('disconnect', function () {
	                debug('Bridge_S1 disconnected ', socket.id);
	                delete Bridge_S1.sockets[socket.id];
	                bridge_Pool_1.default.bridgeInternalSocketDisconnected(socket.id);
	            });
	            socket.on(MESSAGES_1.MSG.CHECK_URL, function (url) {
	                debug('AAA_MSG.CHECK_URL', url);
	                var logger = serverLog_1.default.Log.child({
	                    script: 'Bridge_S1',
	                    url: url
	                });
	                logger.debug('AAA_MSG.CHECK_URL');
	                _this.cache.checkURL(url, function (status, data) {
	                    logger.debug({ status: status, data: data }, 'AAA_MSG.CHECK_URL RESPONSE');
	                    socket.emit(status, data);
	                });
	            });
	        });
	    }
	    Bridge_S1.prototype.createTmpFile = function (html) {
	        var fileObj = tmp.fileSync({ mode: 777, prefix: 'prefix-', postfix: '.html' });
	        fs.writeSync(fileObj.fd, html, 0, 'utf-8');
	        fs.closeSync(fileObj.fd);
	        fs.chmodSync(fileObj.name, '0777');
	        return fileObj.name;
	    };
	    Bridge_S1.notifyClient = function (socketID, uid, status) {
	        var logger = serverLog_1.default.Log.child({
	            script: 'Bridge_S1',
	            uid: uid,
	            status: status.status
	        });
	        logger.debug('Bridge_S1 emit.Bridge_MSG_1.RENDER_STATUS');
	        Bridge_S1.sockets[socketID].emit(MESSAGES_1.MSG.RENDER_STATUS, status);
	    };
	    Bridge_S1.prototype.stop = function () {
	        this.server.close();
	    };
	    Bridge_S1.sockets = {};
	    return Bridge_S1;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Bridge_S1;


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("socket.io");

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var uuid = __webpack_require__(15);
	var bridge_S1_1 = __webpack_require__(12);
	var MESSAGES_1 = __webpack_require__(16);
	var fs = __webpack_require__(2);
	var serverLog_1 = __webpack_require__(6);
	var slimerProcess_1 = __webpack_require__(17);
	var debug = __webpack_require__(9)('ngServer-Bridge_Pool');
	var Bridge_Pool = (function () {
	    function Bridge_Pool() {
	    }
	    Bridge_Pool.init = function (serverConfig) {
	        Bridge_Pool.serverConfig = serverConfig;
	    };
	    Bridge_Pool.addRender = function (socketId, query) {
	        var uid = uuid.v4();
	        var logger = serverLog_1.default.Log.child({ uid: uid, script: 'Bridge_Pool' });
	        debug('new UID cerated: ', uid, 'for query: ', query);
	        Bridge_Pool.pool[uid] = {
	            query: query,
	            socketId: socketId,
	            status: MESSAGES_1.ENUM_RENDER_STATUS.QUEUED,
	            exit: false,
	            benchmark: {
	                queued: Date.now(),
	                started: 0,
	                closed: 0
	            }
	        };
	        logger.debug({ pool: Bridge_Pool.pool[uid] }, 'new UID created: ' + uid);
	        Bridge_Pool.order.push(uid);
	        if (Bridge_Pool.next() !== uid) {
	            Bridge_Pool.notifyBridgeInternal(uid);
	        }
	    };
	    Bridge_Pool.next = function () {
	        if (Bridge_Pool.order.length === 0 || Bridge_Pool.order.length === Bridge_Pool.maxConcurency) {
	            serverLog_1.default.Log.child({ script: 'Bridge_Pool' }).warn('The processing pool is now empty');
	            return null;
	        }
	        var nextUID = Bridge_Pool.order.shift();
	        Bridge_Pool.pool[nextUID].status = MESSAGES_1.ENUM_RENDER_STATUS.STARTED;
	        Bridge_Pool.pool[nextUID].benchmark.started = Date.now();
	        Bridge_Pool.pool[nextUID].spawner = new slimerProcess_1.default(nextUID);
	        Bridge_Pool.notifyBridgeInternal(nextUID);
	        return nextUID;
	    };
	    Bridge_Pool.sendHTML_to_Client = function (uid, html) {
	        Bridge_Pool.pool[uid].html = html;
	        Bridge_Pool.pool[uid].status = MESSAGES_1.ENUM_RENDER_STATUS.HTML;
	        Bridge_Pool.notifyBridgeInternal(uid);
	        if (Bridge_Pool.pool[uid].exit) {
	            Bridge_Pool.deleteUID(uid);
	            Bridge_Pool.next();
	        }
	    };
	    Bridge_Pool.notifyBridgeInternal = function (uid) {
	        if (typeof Bridge_Pool.pool[uid] === 'undefined') {
	        }
	        if (Bridge_Pool.pool[uid].status === MESSAGES_1.ENUM_RENDER_STATUS.HTML) {
	            bridge_S1_1.default.notifyClient(Bridge_Pool.pool[uid].socketId, uid, {
	                status: MESSAGES_1.ENUM_RENDER_STATUS.HTML,
	                html: Bridge_Pool.pool[uid].html
	            });
	        }
	        else {
	            bridge_S1_1.default.notifyClient(Bridge_Pool.pool[uid].socketId, uid, {
	                status: Bridge_Pool.pool[uid].status
	            });
	        }
	    };
	    Bridge_Pool.bridgeInternalSocketDisconnected = function (socketId) {
	        for (var uid in Bridge_Pool.pool) {
	            if (Bridge_Pool.pool[uid].socketId === socketId) {
	                if (Bridge_Pool.pool[uid].exit) {
	                    Bridge_Pool.deleteUID(uid);
	                    Bridge_Pool.next();
	                }
	                return;
	            }
	        }
	    };
	    Bridge_Pool.deleteUID = function (uid) {
	        debug('deleting uid ', uid);
	        if (Bridge_Pool.pool[uid].query.tmp) {
	            fs.removeSync(Bridge_Pool.pool[uid].query.tmp);
	        }
	        delete Bridge_Pool.pool[uid];
	    };
	    Bridge_Pool.generateFullURL = function (info) {
	        return info.protocol + info.host + ':' + info.port;
	    };
	    Bridge_Pool.order = [];
	    Bridge_Pool.pool = {};
	    Bridge_Pool.maxConcurency = 10;
	    return Bridge_Pool;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Bridge_Pool;


/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = require("node-uuid");

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';
	exports.MSG = {
	    CHECK_URL: 'CHECK_URL',
	    GET_URL: 'GET_URL',
	    ANSWER: 'PARAM_CLIENT_ANSWER',
	    RENDER_STATUS: 'ENUM_CACHE_STATUS',
	    IDLE: 'IDLE',
	    LOG: 'LOG',
	    ERROR: 'ERROR',
	};
	(function (ENUM_RENDER_STATUS) {
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["STARTED"] = 0] = "STARTED";
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["QUEUED"] = 1] = "QUEUED";
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["HTML"] = 2] = "HTML";
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["ERROR"] = 3] = "ERROR";
	})(exports.ENUM_RENDER_STATUS || (exports.ENUM_RENDER_STATUS = {}));
	var ENUM_RENDER_STATUS = exports.ENUM_RENDER_STATUS;
	;
	(function (ENUM_CACHE_STATUS) {
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["RENDER_CACHE"] = 0] = "RENDER_CACHE";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["NO_RENDER"] = 1] = "NO_RENDER";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["HTML"] = 2] = "HTML";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["RENDER_NO_CACHE"] = 3] = "RENDER_NO_CACHE";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["ERROR"] = 4] = "ERROR";
	})(exports.ENUM_CACHE_STATUS || (exports.ENUM_CACHE_STATUS = {}));
	var ENUM_CACHE_STATUS = exports.ENUM_CACHE_STATUS;
	;
	(function (ENUM_SLIMER_ERRORS) {
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["FILE_ACCESS_ERROR"] = 5] = "FILE_ACCESS_ERROR";
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["NETWORK_ERROR"] = 6] = "NETWORK_ERROR";
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["WEBAPP_ERROR"] = 7] = "WEBAPP_ERROR";
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["LOGIC_ERROR"] = 8] = "LOGIC_ERROR";
	})(exports.ENUM_SLIMER_ERRORS || (exports.ENUM_SLIMER_ERRORS = {}));
	var ENUM_SLIMER_ERRORS = exports.ENUM_SLIMER_ERRORS;
	;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var path = __webpack_require__(1);
	var spawner_1 = __webpack_require__(18);
	var bridge_Pool_1 = __webpack_require__(14);
	var serverLog_1 = __webpack_require__(6);
	var MESSAGES_1 = __webpack_require__(16);
	var debug = __webpack_require__(9)('ngServer-SlimerProcess');
	var SlimerProcess = (function () {
	    function SlimerProcess(uid) {
	        var _this = this;
	        this.uid = uid;
	        this.killed = false;
	        var latestSlimer = path.join(__dirname, './../slimerjs/slimerjs');
	        this.spawner = new spawner_1.default(this.uid, latestSlimer);
	        debug('LAUNCHING ', path.join(__dirname, 'DDD.js'));
	        this.spawner.setParameters([
	            path.join(__dirname, 'slimer-page.js'),
	            this.uid,
	            bridge_Pool_1.default.pool[uid].query.url,
	            bridge_Pool_1.default.generateFullURL(bridge_Pool_1.default.serverConfig.socketServers.bridge_internal),
	            bridge_Pool_1.default.generateFullURL(bridge_Pool_1.default.serverConfig.socketServers.proxy),
	            bridge_Pool_1.default.pool[uid].query.tmp ? bridge_Pool_1.default.pool[uid].query.tmp : ''
	        ]);
	        bridge_Pool_1.default.pool[this.uid].pid = this.spawner.launch(false, function (data) {
	            debug(data);
	        }, function (code, signal) {
	            _this.onProcessExit(code, signal);
	        });
	        this.timeout = setTimeout(function () {
	            _this.kill(1977);
	        }, bridge_Pool_1.default.serverConfig.timeout * 1000);
	    }
	    SlimerProcess.prototype.kill = function (code) {
	        debug('invoking OnProcessExit');
	        var processInfo = bridge_Pool_1.default.pool[this.uid];
	        this.onProcessExit(code, null);
	        debug('invoking spawner.exit()');
	        serverLog_1.default.Log.child({
	            uid: this.uid,
	            script: 'Bridge_Pool'
	        }).debug({ pid: processInfo.pid }, 'killing spawner');
	        this.spawner.exit();
	    };
	    SlimerProcess.prototype.getSpawner = function () {
	        return this.spawner.info();
	    };
	    SlimerProcess.prototype.onProcessExit = function (code, signal) {
	        debug('onProcessExit called', code, signal, this.uid);
	        if (this.killed)
	            return;
	        this.killed = true;
	        var logger = serverLog_1.default.Log.child({
	            uid: this.uid,
	            script: 'slimerProcess',
	            code: code,
	            signal: signal
	        });
	        logger.debug('onProcessExit called');
	        clearTimeout(this.timeout);
	        bridge_Pool_1.default.pool[this.uid].benchmark.closed = Date.now();
	        if (code === 1977) {
	            debug('code 1977 (timeout) caught');
	            logger.error('Code 1977 timeout caught');
	        }
	        if (code !== 0) {
	            logger.error('Spawner exited with an error');
	            bridge_Pool_1.default.pool[this.uid].status = MESSAGES_1.ENUM_RENDER_STATUS.ERROR;
	            bridge_Pool_1.default.notifyBridgeInternal(this.uid);
	            bridge_Pool_1.default.deleteUID(this.uid);
	            bridge_Pool_1.default.next();
	        }
	        else {
	            if (bridge_Pool_1.default.pool[this.uid].status === MESSAGES_1.ENUM_RENDER_STATUS.HTML) {
	                debug('There is HTML, lets next()');
	                bridge_Pool_1.default.deleteUID(this.uid);
	                bridge_Pool_1.default.next();
	            }
	            else {
	                debug('there is no html, lets wait');
	                bridge_Pool_1.default.pool[this.uid].exit = true;
	            }
	        }
	    };
	    return SlimerProcess;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SlimerProcess;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var child_process = __webpack_require__(19);
	var serverLog_1 = __webpack_require__(6);
	var debug = __webpack_require__(9)('ngServer-spawner');
	var Spawner = (function () {
	    function Spawner(name, binPath, xvfb) {
	        if (xvfb === void 0) { xvfb = false; }
	        this.name = name;
	        this.binPath = binPath;
	        this.xvfb = xvfb;
	        this.params = [];
	        if (xvfb) {
	            this.params.push(this.binPath);
	            this.binPath = 'xvfb-run';
	        }
	    }
	    Spawner.prototype.info = function () {
	        return {
	            params: this.params,
	            binPath: this.binPath,
	            xvfb: this.xvfb,
	            pid: this.child.pid,
	            connected: this.child.connected
	        };
	    };
	    Spawner.prototype.setParameters = function (params) {
	        this.params.push.apply(this.params, params);
	    };
	    Spawner.prototype.launch = function (relaunchOnError, onStdErr, onClose) {
	        var _this = this;
	        debug('Going to launch', this.binPath, this.params);
	        var logger = serverLog_1.default.Log.child({
	            uid: this.name,
	            script: 'Spawner',
	            bin: this.binPath,
	            params: this.params
	        });
	        logger.debug('Launching new process');
	        this.child = child_process.spawn(this.binPath, this.params, { stdio: [0, 1, 2] });
	        this.child.on('error', function (err) {
	            debug(_this.name, 'this.child.onError ', err);
	            logger.debug({ err: err }, 'this.child.onError');
	        });
	        this.child.on('close', function (code, signal) {
	            debug(_this.name, 'this.child.onClose', code, signal);
	            if (code !== 0) {
	                if (relaunchOnError) {
	                    debug('relaunching');
	                    _this.launch(relaunchOnError, onStdErr, onClose);
	                }
	                onClose(code, signal);
	            }
	            else {
	            }
	            onClose(code, null);
	        });
	        return this.child.pid;
	    };
	    Spawner.prototype.exit = function () {
	        var _this = this;
	        debug(this.name, 'exit() invoked');
	        setImmediate(function () {
	            return _this.child.kill();
	        });
	    };
	    return Spawner;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Spawner;


/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("child_process");

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = require("tmp");

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var io = __webpack_require__(13);
	var http = __webpack_require__(23);
	var bridge_Pool_1 = __webpack_require__(14);
	var MESSAGES_1 = __webpack_require__(16);
	var cache_1 = __webpack_require__(24);
	var serverLog_1 = __webpack_require__(6);
	var preboot = __webpack_require__(26);
	var debug = __webpack_require__(9)('ngServer-Bridge_S2');
	var Bridge_S2 = (function () {
	    function Bridge_S2(port) {
	        var _this = this;
	        this.preboot = false;
	        this.httpServer = http.createServer(function (req, res) {
	            debug('requesting ', req.url);
	            res.writeHead(500, { 'Content-Type': 'text/html' });
	            res.end('Forbidden');
	        });
	        this.socketServer = io.listen(this.httpServer, {
	            allowRequest: function (handshake, cb) {
	                debug(handshake._query);
	                if (typeof handshake._query.token === 'undefined') {
	                    return cb(null, true);
	                }
	                if (typeof bridge_Pool_1.default.pool[handshake._query.token] === 'undefined') {
	                    return cb(null, true);
	                }
	                cb(null, true);
	            }
	        });
	        this.httpServer.listen(port);
	        this.socketServer.on('connection', function (socket) {
	            debug('bridge_internal new connection');
	            socket.on(MESSAGES_1.MSG.LOG, function (data) {
	                debug('going to log type / args ', data.type, data.args);
	                var logger = serverLog_1.default.WebAppLog.child({ uid: data.uid, script: 'EEE' });
	                switch (data.type) {
	                    case 'dev':
	                        logger.trace(data.args);
	                        break;
	                    case 'debug':
	                        logger.debug(data.args);
	                        break;
	                    case 'log':
	                    case 'info':
	                        logger.info(data.args);
	                        break;
	                    case 'warn':
	                        logger.warn(data.args);
	                        break;
	                    case 'error':
	                        logger.error(data.args);
	                        break;
	                }
	            });
	            socket.on(MESSAGES_1.MSG.ERROR, function (err) {
	                var errorObject = JSON.parse(err);
	                debug('DDD_MSG_ERROR received', errorObject);
	                serverLog_1.default.Log.child({ uid: errorObject.uid, script: 'Bridge_S2' }).error(errorObject);
	                socket.emit(MESSAGES_1.MSG.ERROR + errorObject.uid);
	            });
	            socket.on(MESSAGES_1.MSG.IDLE, function (response) {
	                debug('received IDLE from EEE', response.uid, response.url, response.html.length);
	                debug('responseCache = ', response.exportedCache);
	                var serialized = JSON.stringify(response.exportedCache);
	                var script = "<script type=\"text/javascript\">window.ngServerCache = " + serialized + ";</script></head>";
	                var superHTML = response.html.replace(/<\/head>/, script);
	                if (_this.preboot) {
	                    var prebootOptions = {
	                        appRoot: 'document.body'
	                    };
	                    var inlinePrebootCode = '<script type="text/javascript">' + preboot.getInlineCode(prebootOptions) + '</script></body>';
	                    superHTML = superHTML.replace(/<\/body>/, inlinePrebootCode);
	                }
	                if (bridge_Pool_1.default.pool[response.uid].query.strategy === MESSAGES_1.ENUM_CACHE_STATUS.RENDER_CACHE) {
	                    var newUrl = new cache_1.UrlCache(bridge_Pool_1.default.pool[response.uid].query.url);
	                    newUrl.set(superHTML, {}, function (err, status) {
	                        if (err) {
	                            serverLog_1.default.Log.child({ uid: response.uid, script: 'Bridge_S2' }).error({ response: response, err: err });
	                            throw err;
	                        }
	                        debug('Cache on Bridge_MSG_2.CACHE_IT status = ', status);
	                    });
	                }
	                bridge_Pool_1.default.sendHTML_to_Client(response.uid, superHTML);
	                socket.emit(MESSAGES_1.MSG.IDLE + response.uid);
	            });
	            socket.on('disconnect', function () {
	                debug('bridge_internal  deconnected');
	            });
	        });
	    }
	    Bridge_S2.prototype.stop = function (cb) {
	        this.socketServer.close();
	        this.httpServer.close(function () {
	            cb();
	        });
	    };
	    return Bridge_S2;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Bridge_S2;


/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var MESSAGES_1 = __webpack_require__(16);
	var redis_url_cache_1 = __webpack_require__(5);
	var validators_1 = __webpack_require__(25);
	var serverLog_1 = __webpack_require__(6);
	var path = __webpack_require__(1);
	var yaml = __webpack_require__(4);
	var fs = __webpack_require__(2);
	var debug = __webpack_require__(9)('ngServer-Cache');
	var Cache = (function () {
	    function Cache(configDir, cb) {
	        var _this = this;
	        var serverConfigpath = path.join(configDir, 'serverConfig.yml');
	        this.serverConfig = yaml.load(fs.readFileSync(serverConfigpath, 'utf8'));
	        var renderRulesPath = path.join(configDir, 'serverRenderRules.yml');
	        this.renderRules = validators_1.default.unserializeServerRules(yaml.load(fs.readFileSync(renderRulesPath, 'utf8')));
	        var cacheRulesPath = path.join(configDir, 'serverCacheRules.yml');
	        this.cacheRules = redis_url_cache_1.CacheEngineCB.helpers.unserializeCacheRules(yaml.load(fs.readFileSync(cacheRulesPath, 'utf8')));
	        redis_url_cache_1.CacheCreator.createCache('SERVER', true, this.serverConfig.redisConfig, this.cacheRules, function (err) {
	            if (err) {
	                debug('Some error: ', err);
	                var error = new Error(err);
	                _this.logger.error(error);
	                return cb(err);
	            }
	            UrlCache.loadCacheEngine(_this.serverConfig.domain, 'SERVER', _this.serverConfig.redisConfig, function (err) {
	                if (err) {
	                    var error = new Error(err);
	                    _this.logger.error(error);
	                    return cb(err);
	                }
	                cb(null);
	            });
	        });
	    }
	    Cache.prototype.checkURL = function (url, cb) {
	        var _this = this;
	        this.logger = serverLog_1.default.Log.child({
	            script: 'Cache',
	            url: url
	        });
	        if (!this.shouldRender(url)) {
	            cb(MESSAGES_1.MSG.ANSWER, { status: MESSAGES_1.ENUM_CACHE_STATUS.NO_RENDER });
	        }
	        else {
	            var bbb_url_1 = new UrlCache(url);
	            if (bbb_url_1.shouldCache()) {
	                debug('Should cache');
	                bbb_url_1.has(function (err, isCached) {
	                    if (err) {
	                        _this.logger.error(new Error(err));
	                        debug('Error happened, ', err);
	                        return cb(MESSAGES_1.MSG.ANSWER, { status: MESSAGES_1.ENUM_CACHE_STATUS.ERROR, err: err });
	                    }
	                    if (!isCached) {
	                        debug('is not cached');
	                        return cb(MESSAGES_1.MSG.ANSWER, { status: MESSAGES_1.ENUM_CACHE_STATUS.RENDER_CACHE });
	                    }
	                    else {
	                        debug('is cached');
	                        bbb_url_1.get(function (err, result) {
	                            if (err) {
	                                if (typeof err === 'string') {
	                                    _this.logger.error(new Error(err));
	                                }
	                                else {
	                                    _this.logger.error(err);
	                                }
	                                debug('Error happened, ', err);
	                                return cb(MESSAGES_1.MSG.ANSWER, { status: MESSAGES_1.ENUM_CACHE_STATUS.ERROR, err: err });
	                            }
	                            cb(MESSAGES_1.MSG.ANSWER, { status: MESSAGES_1.ENUM_CACHE_STATUS.HTML, html: result.content });
	                        });
	                    }
	                });
	            }
	            else {
	                debug('should not cache');
	                cb(MESSAGES_1.MSG.ANSWER, { status: MESSAGES_1.ENUM_CACHE_STATUS.RENDER_NO_CACHE });
	            }
	        }
	    };
	    Cache.prototype.shouldRender = function (url) {
	        var i, regex;
	        debug('shouldRender called with url, renderConfig ', url, this.renderRules);
	        switch (this.renderRules.strategy) {
	            case 'never':
	                return false;
	            case 'always':
	                return true;
	            case 'include':
	                for (i in this.renderRules.rules) {
	                    regex = this.renderRules.rules[i];
	                    if (regex.test(url)) {
	                        return true;
	                    }
	                }
	                return false;
	            case 'exclude':
	                for (i in this.renderRules.rules) {
	                    regex = this.renderRules.rules[i];
	                    if (regex.test(url)) {
	                        return false;
	                    }
	                }
	                return true;
	        }
	    };
	    return Cache;
	}());
	exports.Cache = Cache;
	var UrlCache = (function () {
	    function UrlCache(url) {
	        this.url = url;
	        this.URL = UrlCache.cacheEngine.url(url);
	    }
	    UrlCache.loadCacheEngine = function (defaultDomain, instanceName, redisConfig, cb) {
	        var instance = new redis_url_cache_1.Instance(instanceName, redisConfig, {}, function (err) {
	            if (err)
	                return cb(err);
	            UrlCache.cacheEngine = new redis_url_cache_1.CacheEngineCB(defaultDomain, instance);
	            cb(null);
	        });
	    };
	    UrlCache.prototype.shouldCache = function () {
	        return this.URL.getCategory() === 'never' ? false : true;
	    };
	    UrlCache.prototype.has = function (cb) {
	        this.URL.has(cb);
	    };
	    UrlCache.prototype.get = function (cb) {
	        this.URL.get(cb);
	    };
	    UrlCache.prototype.set = function (content, extra, cb) {
	        this.URL.set(content, extra, false, cb);
	    };
	    return UrlCache;
	}());
	exports.UrlCache = UrlCache;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var redis_url_cache_1 = __webpack_require__(5);
	var Validators = (function () {
	    function Validators() {
	    }
	    Validators.unserializeServerRules = function (rules) {
	        var index, regex;
	        for (index in rules.rules) {
	            regex = redis_url_cache_1.CacheEngineCB.helpers.unserializeRegex(rules.rules[index]);
	            rules.rules[index] = regex;
	        }
	        return rules;
	    };
	    return Validators;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Validators;


/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = require("preboot");

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNWI0Yjc2ZDAzNWRiMDEzYzM0ZmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3RlclByb2Nlc3MudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImZzLWV4dHJhXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXN5bmNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqcy15YW1sXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVkaXMtdXJsLWNhY2hlXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZlckxvZy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJidW55YW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJnZWxmLXN0cmVhbVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImRlYnVnXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY2RuLXNlcnZlclwiIiwid2VicGFjazovLy8uL3NyYy9icmlkZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JyaWRnZV9TMS50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzb2NrZXQuaW9cIiIsIndlYnBhY2s6Ly8vLi9zcmMvYnJpZGdlX1Bvb2wudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibm9kZS11dWlkXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL01FU1NBR0VTLnRzIiwid2VicGFjazovLy8uL3NyYy9zbGltZXJQcm9jZXNzLnRzIiwid2VicGFjazovLy8uL3NyYy9zcGF3bmVyLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInRtcFwiIiwid2VicGFjazovLy8uL3NyYy9icmlkZ2VfUzIudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiaHR0cFwiIiwid2VicGFjazovLy8uL3NyYy9jYWNoZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdmFsaWRhdG9ycy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwcmVib290XCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckIsa0JBQWlCO0FBQ2pCO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7Ozs7Ozs7QUMzRkEsa0M7Ozs7OztBQ0FBLHNDOzs7Ozs7QUNBQSxtQzs7Ozs7O0FDQUEscUM7Ozs7OztBQ0FBLDZDOzs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNELCtDQUE4QyxjQUFjO0FBQzVEOzs7Ozs7O0FDbEdBLHVDOzs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDLGdFQUFnRTtBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQyw4REFBOEQ7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDLGdFQUFnRTtBQUNqRTtBQUNBOzs7Ozs7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUyxTQUFTLHVCQUF1QjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNELCtDQUE4QyxjQUFjO0FBQzVEOzs7Ozs7O0FDdEZBO0FBQ0E7QUFDQTtBQUNB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O0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0ZBQW1GO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7Ozs7Ozs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRCwrQ0FBOEMsY0FBYztBQUM1RDs7Ozs7OztBQ2hCQSxxQyIsImZpbGUiOiJuZy1zZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA1YjRiNzZkMDM1ZGIwMTNjMzRmYSIsIlwidXNlIHN0cmljdFwiO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xudmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmMnKTtcbnZhciB5YW1sID0gcmVxdWlyZSgnanMteWFtbCcpO1xudmFyIHJlZGlzX3VybF9jYWNoZV8xID0gcmVxdWlyZSgncmVkaXMtdXJsLWNhY2hlJyk7XG52YXIgc2VydmVyTG9nXzEgPSByZXF1aXJlKCcuL3NlcnZlckxvZycpO1xudmFyIGNkbl9zZXJ2ZXJfMSA9IHJlcXVpcmUoJ2Nkbi1zZXJ2ZXInKTtcbnZhciBicmlkZ2VfMSA9IHJlcXVpcmUoJy4vYnJpZGdlJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCduZ1NlcnZlcicpO1xudmFyIE1hc3RlclByb2Nlc3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1hc3RlclByb2Nlc3MoY29uZmlnRGlyKSB7XG4gICAgICAgIHRoaXMuY29uZmlnRGlyID0gY29uZmlnRGlyO1xuICAgICAgICBkZWJ1ZygnRElSTkFNRSA9ICcsIF9fZGlybmFtZSk7XG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhjb25maWdEaXIpKSB7XG4gICAgICAgICAgICB0aHJvdyBcIlRoZSBjb25maWcgZGlyIGRvZXNuJ3QgZXhpc3RzIFwiICsgY29uZmlnRGlyO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb25maWdQYXRoO1xuICAgICAgICBbJ3NlcnZlckNvbmZpZy55bWwnLCAnc2VydmVyUmVuZGVyUnVsZXMueW1sJywgJ3NlcnZlckNhY2hlUnVsZXMueW1sJywgJ3NsaW1lclJlc3RDYWNoZVJ1bGVzLnltbCddLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4oY29uZmlnRGlyLCBpdGVtKTtcbiAgICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhjb25maWdQYXRoKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGNvbmZpZyBmaWxlICcgKyBjb25maWdQYXRoICsgJyBkb2VzbnQgZXhpc3RzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5YW1sLmxvYWQoZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsICd1dGY4JykpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXJ2ZXJDb25maWcgPSB5YW1sLmxvYWQoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0aGlzLmNvbmZpZ0RpciwgJ3NlcnZlckNvbmZpZy55bWwnKSwgJ3V0ZjgnKSk7XG4gICAgICAgIGRlYnVnKCdzZXJ2ZXJDb25maWcgICcsIHRoaXMuc2VydmVyQ29uZmlnKTtcbiAgICAgICAgc2VydmVyTG9nXzEuZGVmYXVsdC5pbml0TG9ncyh0aGlzLnNlcnZlckNvbmZpZy5sb2dCYXNlUGF0aCwgdGhpcy5zZXJ2ZXJDb25maWcuZ2VsZik7XG4gICAgICAgIHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmluZm8oJ01hc3RlciBzdGFydGluZycpO1xuICAgIH1cbiAgICBNYXN0ZXJQcm9jZXNzLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgc2xpbWVyUmVzdENhY2hlTW9kdWxlUGF0aCA9IHBhdGguam9pbih0aGlzLmNvbmZpZ0RpciwgJ3NsaW1lclJlc3RDYWNoZVJ1bGVzLnltbCcpO1xuICAgICAgICB2YXIgY2FjaGVSdWxlcyA9IHtcbiAgICAgICAgICAgIFNsaW1lcl9SZXN0OiByZWRpc191cmxfY2FjaGVfMS5DYWNoZUVuZ2luZUNCLmhlbHBlcnMudW5zZXJpYWxpemVDYWNoZVJ1bGVzKHlhbWwubG9hZChmcy5yZWFkRmlsZVN5bmMoc2xpbWVyUmVzdENhY2hlTW9kdWxlUGF0aCwgJ3V0ZjgnKSkpXG4gICAgICAgIH07XG4gICAgICAgIHZhciBwYXJyYWxsZWxGbnMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGNhY2hlUnVsZXMpIHtcbiAgICAgICAgICAgIHBhcnJhbGxlbEZuc1trZXldID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgICAgICAgICAgcmVkaXNfdXJsX2NhY2hlXzEuQ2FjaGVDcmVhdG9yLmNyZWF0ZUNhY2hlKGtleS50b1VwcGVyQ2FzZSgpLCB0cnVlLCBfdGhpcy5zZXJ2ZXJDb25maWcucmVkaXNDb25maWcsIGNhY2hlUnVsZXNba2V5XSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICAgICAgICAgIGNiKG51bGwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBkZWJ1ZygnU3RhcnRpbmcnKTtcbiAgICAgICAgYXN5bmMucGFyYWxsZWwocGFycmFsbGVsRm5zLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5icmlkZ2UgPSBuZXcgYnJpZGdlXzEuZGVmYXVsdChfdGhpcy5jb25maWdEaXIpO1xuICAgICAgICAgICAgICAgIF90aGlzLmJyaWRnZS5zdGFydChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubGF1bmNoQ0ROU2VydmVyKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBNYXN0ZXJQcm9jZXNzLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuYnJpZGdlLnN0b3AoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuY2RuU2VydmVyLnN0b3AoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBNYXN0ZXJQcm9jZXNzLnByb3RvdHlwZS5sYXVuY2hDRE5TZXJ2ZXIgPSBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgdmFyIGNhY2hlUnVsZXMgPSByZWRpc191cmxfY2FjaGVfMS5DYWNoZUVuZ2luZUNCLmhlbHBlcnMudW5zZXJpYWxpemVDYWNoZVJ1bGVzKHlhbWwubG9hZChmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHRoaXMuY29uZmlnRGlyLCAnc2xpbWVyUmVzdENhY2hlUnVsZXMueW1sJyksICd1dGY4JykpKTtcbiAgICAgICAgdmFyIGNkbkNvbmZpZyA9IHtcbiAgICAgICAgICAgIGRlZmF1bHREb21haW46IHRoaXMuc2VydmVyQ29uZmlnLmRvbWFpbixcbiAgICAgICAgICAgIHBvcnQ6IHRoaXMuc2VydmVyQ29uZmlnLnNvY2tldFNlcnZlcnMucHJveHkucG9ydCxcbiAgICAgICAgICAgIGluc3RhbmNlTmFtZTogJ1NMSU1FUl9SRVNUJyxcbiAgICAgICAgICAgIHJlZGlzQ29uZmlnOiB0aGlzLnNlcnZlckNvbmZpZy5yZWRpc0NvbmZpZyxcbiAgICAgICAgICAgIGNhY2hlUnVsZXM6IGNhY2hlUnVsZXNcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jZG5TZXJ2ZXIgPSBuZXcgY2RuX3NlcnZlcl8xLkNhY2hlU2VydmVyKGNkbkNvbmZpZywgc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoe1xuICAgICAgICAgICAgc2NyaXB0OiAnQ2FjaGVTZXJ2ZXInXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5jZG5TZXJ2ZXIuc3RhcnQoY2IpO1xuICAgIH07XG4gICAgcmV0dXJuIE1hc3RlclByb2Nlc3M7XG59KCkpO1xubW9kdWxlLmV4cG9ydHMgPSBNYXN0ZXJQcm9jZXNzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbWFzdGVyUHJvY2Vzcy50c1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicGF0aFwiXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImZzLWV4dHJhXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiZnMtZXh0cmFcIlxuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJhc3luY1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImFzeW5jXCJcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianMteWFtbFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImpzLXlhbWxcIlxuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWRpcy11cmwtY2FjaGVcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJyZWRpcy11cmwtY2FjaGVcIlxuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBidW55YW4gPSByZXF1aXJlKCdidW55YW4nKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbnZhciBnZWxmU3RyZWFtID0gcmVxdWlyZSgnZ2VsZi1zdHJlYW0nKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ25nU2VydmVyLXNlcnZlckxvZycpO1xudmFyIFNlcnZlckxvZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2VydmVyTG9nKCkge1xuICAgIH1cbiAgICBTZXJ2ZXJMb2cucG9vbFNlcmlhbGl6ZXIgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcXVlcnk6IGVsZW0ucXVlcnksXG4gICAgICAgICAgICBzdGF0dXM6IGVsZW0uc3RhdHVzLFxuICAgICAgICAgICAgYmVuY2htYXJrOiBlbGVtLmJlbmNobWFyayxcbiAgICAgICAgICAgIHNwYXduZXI6IHR5cGVvZiBlbGVtLnNwYXduZXIgIT09ICd1bmRlZmluZWQnID8gZWxlbS5zcGF3bmVyLmdldFNwYXduZXIoKSA6IG51bGxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFNlcnZlckxvZy5pbml0TG9ncyA9IGZ1bmN0aW9uIChiYXNlUGF0aCwgZ2VsZikge1xuICAgICAgICB2YXIgbG9nUGF0aCA9IGJhc2VQYXRoO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuZW5zdXJlRGlyU3luYyhsb2dQYXRoKTtcbiAgICAgICAgICAgIGZzLmNobW9kU3luYyhsb2dQYXRoLCAnNzc3Jyk7XG4gICAgICAgICAgICBkZWJ1Zyhsb2dQYXRoICsgXCIgaXMgdXNlZCB0byBzdG9yZSBsb2cgRmlsZXNcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGRlYnVnKFwiQ0FOTk9UIGNyZWF0ZSBsb2cgXCIgKyBsb2dQYXRoKTtcbiAgICAgICAgICAgIGxvZ1BhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBiYXNlUGF0aCk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZzLmVuc3VyZURpclN5bmMobG9nUGF0aCk7XG4gICAgICAgICAgICAgICAgZnMuY2htb2RTeW5jKGxvZ1BhdGgsICc3NzcnKTtcbiAgICAgICAgICAgICAgICBkZWJ1Zyhsb2dQYXRoICsgXCIgaXMgdXNlZCB0byBzdG9yZSBsb2cgRmlsZXNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGRlYnVnKGUpO1xuICAgICAgICAgICAgICAgIGRlYnVnKFwiQ0FOTk9UIGNyZWF0ZSBsb2cgXCIgKyBsb2dQYXRoKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFwcFN0cmVhbXMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGV2ZWw6ICd0cmFjZScsXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aC5qb2luKGxvZ1BhdGgsICd0cmFjZS5sb2cnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2luZm8nLFxuICAgICAgICAgICAgICAgIHBhdGg6IHBhdGguam9pbihsb2dQYXRoLCAnaW5mby5sb2cnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4obG9nUGF0aCwgJ2Vycm9yLmxvZycpXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIHZhciB3ZWJBcHBTdHJlYW1zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxldmVsOiAndHJhY2UnLFxuICAgICAgICAgICAgICAgIHBhdGg6IHBhdGguam9pbihsb2dQYXRoLCAnd2ViLWFwcC5sb2cnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4obG9nUGF0aCwgJ3dlYi1hcHAtZXJyb3IubG9nJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICAgICAgaWYgKGdlbGYuZW5hYmxlZCkge1xuICAgICAgICAgICAgdmFyIHN0cmVhbSA9IGdlbGZTdHJlYW0uZm9yQnVueWFuKGdlbGYuaG9zdCwgZ2VsZi5wb3J0KTtcbiAgICAgICAgICAgIGFwcFN0cmVhbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgc3RyZWFtOiBzdHJlYW0sXG4gICAgICAgICAgICAgICAgdHlwZTogJ3JhdycsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICd0cmFjZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd2ViQXBwU3RyZWFtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBzdHJlYW06IHN0cmVhbSxcbiAgICAgICAgICAgICAgICB0eXBlOiAncmF3JyxcbiAgICAgICAgICAgICAgICBsZXZlbDogJ3RyYWNlJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgU2VydmVyTG9nLkxvZyA9IGJ1bnlhbi5jcmVhdGVMb2dnZXIoe1xuICAgICAgICAgICAgbmFtZTogJ1NlcnZlckxvZycsXG4gICAgICAgICAgICBzdHJlYW1zOiBhcHBTdHJlYW1zLFxuICAgICAgICAgICAgc2VyaWFsaXplcnM6IGJ1bnlhbi5zdGRTZXJpYWxpemVyc1xuICAgICAgICB9KTtcbiAgICAgICAgU2VydmVyTG9nLkxvZy5hZGRTZXJpYWxpemVycyh7XG4gICAgICAgICAgICBwb29sOiBTZXJ2ZXJMb2cucG9vbFNlcmlhbGl6ZXJcbiAgICAgICAgfSk7XG4gICAgICAgIFNlcnZlckxvZy5XZWJBcHBMb2cgPSBidW55YW4uY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgICAgIG5hbWU6IFwiV2ViQXBwXCIsXG4gICAgICAgICAgICBzdHJlYW1zOiB3ZWJBcHBTdHJlYW1zLFxuICAgICAgICAgICAgc2VyaWFsaXplcnM6IGJ1bnlhbi5zdGRTZXJpYWxpemVyc1xuICAgICAgICB9KTtcbiAgICAgICAgU2VydmVyTG9nLldlYkFwcExvZy5hZGRTZXJpYWxpemVycyh7XG4gICAgICAgICAgICBwb29sOiBTZXJ2ZXJMb2cucG9vbFNlcmlhbGl6ZXJcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gU2VydmVyTG9nO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFNlcnZlckxvZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL3NlcnZlckxvZy50c1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJidW55YW5cIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJidW55YW5cIlxuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJnZWxmLXN0cmVhbVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImdlbGYtc3RyZWFtXCJcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZGVidWdcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJkZWJ1Z1wiXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNkbi1zZXJ2ZXJcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJjZG4tc2VydmVyXCJcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xudmFyIGJyaWRnZV9TMV8xID0gcmVxdWlyZSgnLi9icmlkZ2VfUzEnKTtcbnZhciBicmlkZ2VfUzJfMSA9IHJlcXVpcmUoJy4vYnJpZGdlX1MyJyk7XG52YXIgYnJpZGdlX1Bvb2xfMSA9IHJlcXVpcmUoJy4vYnJpZGdlX1Bvb2wnKTtcbnZhciBjYWNoZV8xID0gcmVxdWlyZShcIi4vY2FjaGVcIik7XG52YXIgc2VydmVyTG9nXzEgPSByZXF1aXJlKCcuL3NlcnZlckxvZycpO1xudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG52YXIgeWFtbCA9IHJlcXVpcmUoJ2pzLXlhbWwnKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG52YXIgQnJpZGdlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCcmlkZ2UoY29uZmlnRGlyKSB7XG4gICAgICAgIHRoaXMuY29uZmlnRGlyID0gY29uZmlnRGlyO1xuICAgICAgICB2YXIgc2VydmVyQ29uZmlncGF0aCA9IHBhdGguam9pbihjb25maWdEaXIsICdzZXJ2ZXJDb25maWcueW1sJyk7XG4gICAgICAgIHRoaXMuc2VydmVyQ29uZmlnID0geWFtbC5sb2FkKGZzLnJlYWRGaWxlU3luYyhzZXJ2ZXJDb25maWdwYXRoLCAndXRmOCcpKTtcbiAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LmluaXQodGhpcy5zZXJ2ZXJDb25maWcpO1xuICAgICAgICBzZXJ2ZXJMb2dfMS5kZWZhdWx0LmluaXRMb2dzKHRoaXMuc2VydmVyQ29uZmlnLmxvZ0Jhc2VQYXRoLCB0aGlzLnNlcnZlckNvbmZpZy5nZWxmKTtcbiAgICB9XG4gICAgQnJpZGdlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgbG9nZ2VyID0gc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoeyBzY3JpcHQ6ICdCcmlkZ2UnIH0pO1xuICAgICAgICB2YXIgY2FjaGUgPSBuZXcgY2FjaGVfMS5DYWNoZSh0aGlzLmNvbmZpZ0RpciwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IobmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuQnJpZGdlX1MxID0gbmV3IGJyaWRnZV9TMV8xLmRlZmF1bHQoX3RoaXMuc2VydmVyQ29uZmlnLnNvY2tldFNlcnZlcnMuYnJpZGdlX2V4dGVybmFsLnBvcnQsIGNhY2hlKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5CcmlkZ2VfUzIgPSBuZXcgYnJpZGdlX1MyXzEuZGVmYXVsdChfdGhpcy5zZXJ2ZXJDb25maWcuc29ja2V0U2VydmVycy5icmlkZ2VfaW50ZXJuYWwucG9ydCk7XG4gICAgICAgICAgICAgICAgX3RoaXMuQnJpZGdlX1MyLnByZWJvb3QgPSBfdGhpcy5zZXJ2ZXJDb25maWcucHJlYm9vdDtcbiAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgY2IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQnJpZGdlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHRoaXMuQnJpZGdlX1MxLnN0b3AoKTtcbiAgICAgICAgdGhpcy5CcmlkZ2VfUzIuc3RvcChjYik7XG4gICAgfTtcbiAgICByZXR1cm4gQnJpZGdlO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IEJyaWRnZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2JyaWRnZS50c1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvJyk7XG52YXIgYnJpZGdlX1Bvb2xfMSA9IHJlcXVpcmUoJy4vYnJpZGdlX1Bvb2wnKTtcbnZhciBNRVNTQUdFU18xID0gcmVxdWlyZSgnLi9NRVNTQUdFUycpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMnKTtcbnZhciB0bXAgPSByZXF1aXJlKCd0bXAnKTtcbnZhciBzZXJ2ZXJMb2dfMSA9IHJlcXVpcmUoJy4vc2VydmVyTG9nJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCduZ1NlcnZlci1CcmlkZ2VfZXh0ZXJuYWwnKTtcbnZhciBCcmlkZ2VfUzEgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJyaWRnZV9TMShwb3J0LCBjYWNoZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmNhY2hlID0gY2FjaGU7XG4gICAgICAgIGRlYnVnKCdnb2luZyB0byBsaXN0ZW4gdG8gcG9ydCcsIHBvcnQpO1xuICAgICAgICB0aGlzLnNlcnZlciA9IGlvLmxpc3Rlbihwb3J0LCB7XG4gICAgICAgICAgICBhbGxvd1JlcXVlc3Q6IGZ1bmN0aW9uIChoYW5kc2hha2UsIGNiKSB7XG4gICAgICAgICAgICAgICAgY2IobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgICAgIGRlYnVnKCdCcmlkZ2VfUzEgbmV3IGNvbm5lY3Rpb24gJywgc29ja2V0LmlkKTtcbiAgICAgICAgICAgIEJyaWRnZV9TMS5zb2NrZXRzW3NvY2tldC5pZF0gPSBzb2NrZXQ7XG4gICAgICAgICAgICB2YXIgbG9nZ2VyID0gc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoe1xuICAgICAgICAgICAgICAgIHNjcmlwdDogJ0JyaWRnZV9TMSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc29ja2V0Lm9uKE1FU1NBR0VTXzEuTVNHLkdFVF9VUkwsIGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgICAgIGlmIChxdWVyeS5odG1sICYmIHF1ZXJ5Lmh0bWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBxdWVyeS50bXAgPSBfdGhpcy5jcmVhdGVUbXBGaWxlKHF1ZXJ5Lmh0bWwpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVlcnkuaHRtbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVidWcoJ0JyaWRnZV9TMSBvbi5BQUFfTVNHLkdFVF9VUkwnLCBxdWVyeSk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnk6IHF1ZXJ5XG4gICAgICAgICAgICAgICAgfSwgJ0JyaWRnZV9TMSBvbi5BQUFfTVNHLkdFVF9VUkwnKTtcbiAgICAgICAgICAgICAgICBicmlkZ2VfUG9vbF8xLmRlZmF1bHQuYWRkUmVuZGVyKHNvY2tldC5pZCwgcXVlcnkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ0JyaWRnZV9TMSBkaXNjb25uZWN0ZWQgJywgc29ja2V0LmlkKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgQnJpZGdlX1MxLnNvY2tldHNbc29ja2V0LmlkXTtcbiAgICAgICAgICAgICAgICBicmlkZ2VfUG9vbF8xLmRlZmF1bHQuYnJpZGdlSW50ZXJuYWxTb2NrZXREaXNjb25uZWN0ZWQoc29ja2V0LmlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc29ja2V0Lm9uKE1FU1NBR0VTXzEuTVNHLkNIRUNLX1VSTCwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdBQUFfTVNHLkNIRUNLX1VSTCcsIHVybCk7XG4gICAgICAgICAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0OiAnQnJpZGdlX1MxJyxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0FBQV9NU0cuQ0hFQ0tfVVJMJyk7XG4gICAgICAgICAgICAgICAgX3RoaXMuY2FjaGUuY2hlY2tVUkwodXJsLCBmdW5jdGlvbiAoc3RhdHVzLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1Zyh7IHN0YXR1czogc3RhdHVzLCBkYXRhOiBkYXRhIH0sICdBQUFfTVNHLkNIRUNLX1VSTCBSRVNQT05TRScpO1xuICAgICAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdChzdGF0dXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBCcmlkZ2VfUzEucHJvdG90eXBlLmNyZWF0ZVRtcEZpbGUgPSBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICB2YXIgZmlsZU9iaiA9IHRtcC5maWxlU3luYyh7IG1vZGU6IDc3NywgcHJlZml4OiAncHJlZml4LScsIHBvc3RmaXg6ICcuaHRtbCcgfSk7XG4gICAgICAgIGZzLndyaXRlU3luYyhmaWxlT2JqLmZkLCBodG1sLCAwLCAndXRmLTgnKTtcbiAgICAgICAgZnMuY2xvc2VTeW5jKGZpbGVPYmouZmQpO1xuICAgICAgICBmcy5jaG1vZFN5bmMoZmlsZU9iai5uYW1lLCAnMDc3NycpO1xuICAgICAgICByZXR1cm4gZmlsZU9iai5uYW1lO1xuICAgIH07XG4gICAgQnJpZGdlX1MxLm5vdGlmeUNsaWVudCA9IGZ1bmN0aW9uIChzb2NrZXRJRCwgdWlkLCBzdGF0dXMpIHtcbiAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHtcbiAgICAgICAgICAgIHNjcmlwdDogJ0JyaWRnZV9TMScsXG4gICAgICAgICAgICB1aWQ6IHVpZCxcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnN0YXR1c1xuICAgICAgICB9KTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdCcmlkZ2VfUzEgZW1pdC5CcmlkZ2VfTVNHXzEuUkVOREVSX1NUQVRVUycpO1xuICAgICAgICBCcmlkZ2VfUzEuc29ja2V0c1tzb2NrZXRJRF0uZW1pdChNRVNTQUdFU18xLk1TRy5SRU5ERVJfU1RBVFVTLCBzdGF0dXMpO1xuICAgIH07XG4gICAgQnJpZGdlX1MxLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgpO1xuICAgIH07XG4gICAgQnJpZGdlX1MxLnNvY2tldHMgPSB7fTtcbiAgICByZXR1cm4gQnJpZGdlX1MxO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IEJyaWRnZV9TMTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2JyaWRnZV9TMS50c1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwic29ja2V0LmlvXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwic29ja2V0LmlvXCJcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcbnZhciB1dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG52YXIgYnJpZGdlX1MxXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9TMScpO1xudmFyIE1FU1NBR0VTXzEgPSByZXF1aXJlKCcuL01FU1NBR0VTJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xudmFyIHNlcnZlckxvZ18xID0gcmVxdWlyZSgnLi9zZXJ2ZXJMb2cnKTtcbnZhciBzbGltZXJQcm9jZXNzXzEgPSByZXF1aXJlKFwiLi9zbGltZXJQcm9jZXNzXCIpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnbmdTZXJ2ZXItQnJpZGdlX1Bvb2wnKTtcbnZhciBCcmlkZ2VfUG9vbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnJpZGdlX1Bvb2woKSB7XG4gICAgfVxuICAgIEJyaWRnZV9Qb29sLmluaXQgPSBmdW5jdGlvbiAoc2VydmVyQ29uZmlnKSB7XG4gICAgICAgIEJyaWRnZV9Qb29sLnNlcnZlckNvbmZpZyA9IHNlcnZlckNvbmZpZztcbiAgICB9O1xuICAgIEJyaWRnZV9Qb29sLmFkZFJlbmRlciA9IGZ1bmN0aW9uIChzb2NrZXRJZCwgcXVlcnkpIHtcbiAgICAgICAgdmFyIHVpZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHsgdWlkOiB1aWQsIHNjcmlwdDogJ0JyaWRnZV9Qb29sJyB9KTtcbiAgICAgICAgZGVidWcoJ25ldyBVSUQgY2VyYXRlZDogJywgdWlkLCAnZm9yIHF1ZXJ5OiAnLCBxdWVyeSk7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbdWlkXSA9IHtcbiAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgICAgICAgIHNvY2tldElkOiBzb2NrZXRJZCxcbiAgICAgICAgICAgIHN0YXR1czogTUVTU0FHRVNfMS5FTlVNX1JFTkRFUl9TVEFUVVMuUVVFVUVELFxuICAgICAgICAgICAgZXhpdDogZmFsc2UsXG4gICAgICAgICAgICBiZW5jaG1hcms6IHtcbiAgICAgICAgICAgICAgICBxdWV1ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgc3RhcnRlZDogMCxcbiAgICAgICAgICAgICAgICBjbG9zZWQ6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKHsgcG9vbDogQnJpZGdlX1Bvb2wucG9vbFt1aWRdIH0sICduZXcgVUlEIGNyZWF0ZWQ6ICcgKyB1aWQpO1xuICAgICAgICBCcmlkZ2VfUG9vbC5vcmRlci5wdXNoKHVpZCk7XG4gICAgICAgIGlmIChCcmlkZ2VfUG9vbC5uZXh0KCkgIT09IHVpZCkge1xuICAgICAgICAgICAgQnJpZGdlX1Bvb2wubm90aWZ5QnJpZGdlSW50ZXJuYWwodWlkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKEJyaWRnZV9Qb29sLm9yZGVyLmxlbmd0aCA9PT0gMCB8fCBCcmlkZ2VfUG9vbC5vcmRlci5sZW5ndGggPT09IEJyaWRnZV9Qb29sLm1heENvbmN1cmVuY3kpIHtcbiAgICAgICAgICAgIHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHsgc2NyaXB0OiAnQnJpZGdlX1Bvb2wnIH0pLndhcm4oJ1RoZSBwcm9jZXNzaW5nIHBvb2wgaXMgbm93IGVtcHR5Jyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV4dFVJRCA9IEJyaWRnZV9Qb29sLm9yZGVyLnNoaWZ0KCk7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbbmV4dFVJRF0uc3RhdHVzID0gTUVTU0FHRVNfMS5FTlVNX1JFTkRFUl9TVEFUVVMuU1RBUlRFRDtcbiAgICAgICAgQnJpZGdlX1Bvb2wucG9vbFtuZXh0VUlEXS5iZW5jaG1hcmsuc3RhcnRlZCA9IERhdGUubm93KCk7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbbmV4dFVJRF0uc3Bhd25lciA9IG5ldyBzbGltZXJQcm9jZXNzXzEuZGVmYXVsdChuZXh0VUlEKTtcbiAgICAgICAgQnJpZGdlX1Bvb2wubm90aWZ5QnJpZGdlSW50ZXJuYWwobmV4dFVJRCk7XG4gICAgICAgIHJldHVybiBuZXh0VUlEO1xuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wuc2VuZEhUTUxfdG9fQ2xpZW50ID0gZnVuY3Rpb24gKHVpZCwgaHRtbCkge1xuICAgICAgICBCcmlkZ2VfUG9vbC5wb29sW3VpZF0uaHRtbCA9IGh0bWw7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zdGF0dXMgPSBNRVNTQUdFU18xLkVOVU1fUkVOREVSX1NUQVRVUy5IVE1MO1xuICAgICAgICBCcmlkZ2VfUG9vbC5ub3RpZnlCcmlkZ2VJbnRlcm5hbCh1aWQpO1xuICAgICAgICBpZiAoQnJpZGdlX1Bvb2wucG9vbFt1aWRdLmV4aXQpIHtcbiAgICAgICAgICAgIEJyaWRnZV9Qb29sLmRlbGV0ZVVJRCh1aWQpO1xuICAgICAgICAgICAgQnJpZGdlX1Bvb2wubmV4dCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBCcmlkZ2VfUG9vbC5ub3RpZnlCcmlkZ2VJbnRlcm5hbCA9IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBCcmlkZ2VfUG9vbC5wb29sW3VpZF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zdGF0dXMgPT09IE1FU1NBR0VTXzEuRU5VTV9SRU5ERVJfU1RBVFVTLkhUTUwpIHtcbiAgICAgICAgICAgIGJyaWRnZV9TMV8xLmRlZmF1bHQubm90aWZ5Q2xpZW50KEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zb2NrZXRJZCwgdWlkLCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBNRVNTQUdFU18xLkVOVU1fUkVOREVSX1NUQVRVUy5IVE1MLFxuICAgICAgICAgICAgICAgIGh0bWw6IEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5odG1sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJyaWRnZV9TMV8xLmRlZmF1bHQubm90aWZ5Q2xpZW50KEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zb2NrZXRJZCwgdWlkLCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBCcmlkZ2VfUG9vbC5wb29sW3VpZF0uc3RhdHVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wuYnJpZGdlSW50ZXJuYWxTb2NrZXREaXNjb25uZWN0ZWQgPSBmdW5jdGlvbiAoc29ja2V0SWQpIHtcbiAgICAgICAgZm9yICh2YXIgdWlkIGluIEJyaWRnZV9Qb29sLnBvb2wpIHtcbiAgICAgICAgICAgIGlmIChCcmlkZ2VfUG9vbC5wb29sW3VpZF0uc29ja2V0SWQgPT09IHNvY2tldElkKSB7XG4gICAgICAgICAgICAgICAgaWYgKEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5leGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIEJyaWRnZV9Qb29sLmRlbGV0ZVVJRCh1aWQpO1xuICAgICAgICAgICAgICAgICAgICBCcmlkZ2VfUG9vbC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wuZGVsZXRlVUlEID0gZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICBkZWJ1ZygnZGVsZXRpbmcgdWlkICcsIHVpZCk7XG4gICAgICAgIGlmIChCcmlkZ2VfUG9vbC5wb29sW3VpZF0ucXVlcnkudG1wKSB7XG4gICAgICAgICAgICBmcy5yZW1vdmVTeW5jKEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5xdWVyeS50bXApO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBCcmlkZ2VfUG9vbC5wb29sW3VpZF07XG4gICAgfTtcbiAgICBCcmlkZ2VfUG9vbC5nZW5lcmF0ZUZ1bGxVUkwgPSBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICByZXR1cm4gaW5mby5wcm90b2NvbCArIGluZm8uaG9zdCArICc6JyArIGluZm8ucG9ydDtcbiAgICB9O1xuICAgIEJyaWRnZV9Qb29sLm9yZGVyID0gW107XG4gICAgQnJpZGdlX1Bvb2wucG9vbCA9IHt9O1xuICAgIEJyaWRnZV9Qb29sLm1heENvbmN1cmVuY3kgPSAxMDtcbiAgICByZXR1cm4gQnJpZGdlX1Bvb2w7XG59KCkpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gQnJpZGdlX1Bvb2w7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9icmlkZ2VfUG9vbC50c1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZS11dWlkXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwibm9kZS11dWlkXCJcbi8vIG1vZHVsZSBpZCA9IDE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcbmV4cG9ydHMuTVNHID0ge1xuICAgIENIRUNLX1VSTDogJ0NIRUNLX1VSTCcsXG4gICAgR0VUX1VSTDogJ0dFVF9VUkwnLFxuICAgIEFOU1dFUjogJ1BBUkFNX0NMSUVOVF9BTlNXRVInLFxuICAgIFJFTkRFUl9TVEFUVVM6ICdFTlVNX0NBQ0hFX1NUQVRVUycsXG4gICAgSURMRTogJ0lETEUnLFxuICAgIExPRzogJ0xPRycsXG4gICAgRVJST1I6ICdFUlJPUicsXG59O1xuKGZ1bmN0aW9uIChFTlVNX1JFTkRFUl9TVEFUVVMpIHtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiU1RBUlRFRFwiXSA9IDBdID0gXCJTVEFSVEVEXCI7XG4gICAgRU5VTV9SRU5ERVJfU1RBVFVTW0VOVU1fUkVOREVSX1NUQVRVU1tcIlFVRVVFRFwiXSA9IDFdID0gXCJRVUVVRURcIjtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiSFRNTFwiXSA9IDJdID0gXCJIVE1MXCI7XG4gICAgRU5VTV9SRU5ERVJfU1RBVFVTW0VOVU1fUkVOREVSX1NUQVRVU1tcIkVSUk9SXCJdID0gM10gPSBcIkVSUk9SXCI7XG59KShleHBvcnRzLkVOVU1fUkVOREVSX1NUQVRVUyB8fCAoZXhwb3J0cy5FTlVNX1JFTkRFUl9TVEFUVVMgPSB7fSkpO1xudmFyIEVOVU1fUkVOREVSX1NUQVRVUyA9IGV4cG9ydHMuRU5VTV9SRU5ERVJfU1RBVFVTO1xuO1xuKGZ1bmN0aW9uIChFTlVNX0NBQ0hFX1NUQVRVUykge1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiUkVOREVSX0NBQ0hFXCJdID0gMF0gPSBcIlJFTkRFUl9DQUNIRVwiO1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiTk9fUkVOREVSXCJdID0gMV0gPSBcIk5PX1JFTkRFUlwiO1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiSFRNTFwiXSA9IDJdID0gXCJIVE1MXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJSRU5ERVJfTk9fQ0FDSEVcIl0gPSAzXSA9IFwiUkVOREVSX05PX0NBQ0hFXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJFUlJPUlwiXSA9IDRdID0gXCJFUlJPUlwiO1xufSkoZXhwb3J0cy5FTlVNX0NBQ0hFX1NUQVRVUyB8fCAoZXhwb3J0cy5FTlVNX0NBQ0hFX1NUQVRVUyA9IHt9KSk7XG52YXIgRU5VTV9DQUNIRV9TVEFUVVMgPSBleHBvcnRzLkVOVU1fQ0FDSEVfU1RBVFVTO1xuO1xuKGZ1bmN0aW9uIChFTlVNX1NMSU1FUl9FUlJPUlMpIHtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiRklMRV9BQ0NFU1NfRVJST1JcIl0gPSA1XSA9IFwiRklMRV9BQ0NFU1NfRVJST1JcIjtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiTkVUV09SS19FUlJPUlwiXSA9IDZdID0gXCJORVRXT1JLX0VSUk9SXCI7XG4gICAgRU5VTV9TTElNRVJfRVJST1JTW0VOVU1fU0xJTUVSX0VSUk9SU1tcIldFQkFQUF9FUlJPUlwiXSA9IDddID0gXCJXRUJBUFBfRVJST1JcIjtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiTE9HSUNfRVJST1JcIl0gPSA4XSA9IFwiTE9HSUNfRVJST1JcIjtcbn0pKGV4cG9ydHMuRU5VTV9TTElNRVJfRVJST1JTIHx8IChleHBvcnRzLkVOVU1fU0xJTUVSX0VSUk9SUyA9IHt9KSk7XG52YXIgRU5VTV9TTElNRVJfRVJST1JTID0gZXhwb3J0cy5FTlVNX1NMSU1FUl9FUlJPUlM7XG47XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9NRVNTQUdFUy50c1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIHNwYXduZXJfMSA9IHJlcXVpcmUoJy4vc3Bhd25lcicpO1xudmFyIGJyaWRnZV9Qb29sXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9Qb29sJyk7XG52YXIgc2VydmVyTG9nXzEgPSByZXF1aXJlKCcuL3NlcnZlckxvZycpO1xudmFyIE1FU1NBR0VTXzEgPSByZXF1aXJlKCcuL01FU1NBR0VTJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCduZ1NlcnZlci1TbGltZXJQcm9jZXNzJyk7XG52YXIgU2xpbWVyUHJvY2VzcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2xpbWVyUHJvY2Vzcyh1aWQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy51aWQgPSB1aWQ7XG4gICAgICAgIHRoaXMua2lsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhciBsYXRlc3RTbGltZXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi8uLi9zbGltZXJqcy9zbGltZXJqcycpO1xuICAgICAgICB0aGlzLnNwYXduZXIgPSBuZXcgc3Bhd25lcl8xLmRlZmF1bHQodGhpcy51aWQsIGxhdGVzdFNsaW1lcik7XG4gICAgICAgIGRlYnVnKCdMQVVOQ0hJTkcgJywgcGF0aC5qb2luKF9fZGlybmFtZSwgJ0RERC5qcycpKTtcbiAgICAgICAgdGhpcy5zcGF3bmVyLnNldFBhcmFtZXRlcnMoW1xuICAgICAgICAgICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NsaW1lci1wYWdlLmpzJyksXG4gICAgICAgICAgICB0aGlzLnVpZCxcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3VpZF0ucXVlcnkudXJsLFxuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LmdlbmVyYXRlRnVsbFVSTChicmlkZ2VfUG9vbF8xLmRlZmF1bHQuc2VydmVyQ29uZmlnLnNvY2tldFNlcnZlcnMuYnJpZGdlX2ludGVybmFsKSxcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5nZW5lcmF0ZUZ1bGxVUkwoYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnNlcnZlckNvbmZpZy5zb2NrZXRTZXJ2ZXJzLnByb3h5KSxcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3VpZF0ucXVlcnkudG1wID8gYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdWlkXS5xdWVyeS50bXAgOiAnJ1xuICAgICAgICBdKTtcbiAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdGhpcy51aWRdLnBpZCA9IHRoaXMuc3Bhd25lci5sYXVuY2goZmFsc2UsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBkZWJ1ZyhkYXRhKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGNvZGUsIHNpZ25hbCkge1xuICAgICAgICAgICAgX3RoaXMub25Qcm9jZXNzRXhpdChjb2RlLCBzaWduYWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5raWxsKDE5NzcpO1xuICAgICAgICB9LCBicmlkZ2VfUG9vbF8xLmRlZmF1bHQuc2VydmVyQ29uZmlnLnRpbWVvdXQgKiAxMDAwKTtcbiAgICB9XG4gICAgU2xpbWVyUHJvY2Vzcy5wcm90b3R5cGUua2lsbCA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgIGRlYnVnKCdpbnZva2luZyBPblByb2Nlc3NFeGl0Jyk7XG4gICAgICAgIHZhciBwcm9jZXNzSW5mbyA9IGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3RoaXMudWlkXTtcbiAgICAgICAgdGhpcy5vblByb2Nlc3NFeGl0KGNvZGUsIG51bGwpO1xuICAgICAgICBkZWJ1ZygnaW52b2tpbmcgc3Bhd25lci5leGl0KCknKTtcbiAgICAgICAgc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoe1xuICAgICAgICAgICAgdWlkOiB0aGlzLnVpZCxcbiAgICAgICAgICAgIHNjcmlwdDogJ0JyaWRnZV9Qb29sJ1xuICAgICAgICB9KS5kZWJ1Zyh7IHBpZDogcHJvY2Vzc0luZm8ucGlkIH0sICdraWxsaW5nIHNwYXduZXInKTtcbiAgICAgICAgdGhpcy5zcGF3bmVyLmV4aXQoKTtcbiAgICB9O1xuICAgIFNsaW1lclByb2Nlc3MucHJvdG90eXBlLmdldFNwYXduZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNwYXduZXIuaW5mbygpO1xuICAgIH07XG4gICAgU2xpbWVyUHJvY2Vzcy5wcm90b3R5cGUub25Qcm9jZXNzRXhpdCA9IGZ1bmN0aW9uIChjb2RlLCBzaWduYWwpIHtcbiAgICAgICAgZGVidWcoJ29uUHJvY2Vzc0V4aXQgY2FsbGVkJywgY29kZSwgc2lnbmFsLCB0aGlzLnVpZCk7XG4gICAgICAgIGlmICh0aGlzLmtpbGxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5raWxsZWQgPSB0cnVlO1xuICAgICAgICB2YXIgbG9nZ2VyID0gc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoe1xuICAgICAgICAgICAgdWlkOiB0aGlzLnVpZCxcbiAgICAgICAgICAgIHNjcmlwdDogJ3NsaW1lclByb2Nlc3MnLFxuICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgIHNpZ25hbDogc2lnbmFsXG4gICAgICAgIH0pO1xuICAgICAgICBsb2dnZXIuZGVidWcoJ29uUHJvY2Vzc0V4aXQgY2FsbGVkJyk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICBicmlkZ2VfUG9vbF8xLmRlZmF1bHQucG9vbFt0aGlzLnVpZF0uYmVuY2htYXJrLmNsb3NlZCA9IERhdGUubm93KCk7XG4gICAgICAgIGlmIChjb2RlID09PSAxOTc3KSB7XG4gICAgICAgICAgICBkZWJ1ZygnY29kZSAxOTc3ICh0aW1lb3V0KSBjYXVnaHQnKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29kZSAxOTc3IHRpbWVvdXQgY2F1Z2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignU3Bhd25lciBleGl0ZWQgd2l0aCBhbiBlcnJvcicpO1xuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdGhpcy51aWRdLnN0YXR1cyA9IE1FU1NBR0VTXzEuRU5VTV9SRU5ERVJfU1RBVFVTLkVSUk9SO1xuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0Lm5vdGlmeUJyaWRnZUludGVybmFsKHRoaXMudWlkKTtcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5kZWxldGVVSUQodGhpcy51aWQpO1xuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0Lm5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChicmlkZ2VfUG9vbF8xLmRlZmF1bHQucG9vbFt0aGlzLnVpZF0uc3RhdHVzID09PSBNRVNTQUdFU18xLkVOVU1fUkVOREVSX1NUQVRVUy5IVE1MKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ1RoZXJlIGlzIEhUTUwsIGxldHMgbmV4dCgpJyk7XG4gICAgICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LmRlbGV0ZVVJRCh0aGlzLnVpZCk7XG4gICAgICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0Lm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlYnVnKCd0aGVyZSBpcyBubyBodG1sLCBsZXRzIHdhaXQnKTtcbiAgICAgICAgICAgICAgICBicmlkZ2VfUG9vbF8xLmRlZmF1bHQucG9vbFt0aGlzLnVpZF0uZXhpdCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBTbGltZXJQcm9jZXNzO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFNsaW1lclByb2Nlc3M7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zbGltZXJQcm9jZXNzLnRzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBjaGlsZF9wcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xudmFyIHNlcnZlckxvZ18xID0gcmVxdWlyZSgnLi9zZXJ2ZXJMb2cnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ25nU2VydmVyLXNwYXduZXInKTtcbnZhciBTcGF3bmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTcGF3bmVyKG5hbWUsIGJpblBhdGgsIHh2ZmIpIHtcbiAgICAgICAgaWYgKHh2ZmIgPT09IHZvaWQgMCkgeyB4dmZiID0gZmFsc2U7IH1cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5iaW5QYXRoID0gYmluUGF0aDtcbiAgICAgICAgdGhpcy54dmZiID0geHZmYjtcbiAgICAgICAgdGhpcy5wYXJhbXMgPSBbXTtcbiAgICAgICAgaWYgKHh2ZmIpIHtcbiAgICAgICAgICAgIHRoaXMucGFyYW1zLnB1c2godGhpcy5iaW5QYXRoKTtcbiAgICAgICAgICAgIHRoaXMuYmluUGF0aCA9ICd4dmZiLXJ1bic7XG4gICAgICAgIH1cbiAgICB9XG4gICAgU3Bhd25lci5wcm90b3R5cGUuaW5mbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhcmFtczogdGhpcy5wYXJhbXMsXG4gICAgICAgICAgICBiaW5QYXRoOiB0aGlzLmJpblBhdGgsXG4gICAgICAgICAgICB4dmZiOiB0aGlzLnh2ZmIsXG4gICAgICAgICAgICBwaWQ6IHRoaXMuY2hpbGQucGlkLFxuICAgICAgICAgICAgY29ubmVjdGVkOiB0aGlzLmNoaWxkLmNvbm5lY3RlZFxuICAgICAgICB9O1xuICAgIH07XG4gICAgU3Bhd25lci5wcm90b3R5cGUuc2V0UGFyYW1ldGVycyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMucHVzaC5hcHBseSh0aGlzLnBhcmFtcywgcGFyYW1zKTtcbiAgICB9O1xuICAgIFNwYXduZXIucHJvdG90eXBlLmxhdW5jaCA9IGZ1bmN0aW9uIChyZWxhdW5jaE9uRXJyb3IsIG9uU3RkRXJyLCBvbkNsb3NlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGRlYnVnKCdHb2luZyB0byBsYXVuY2gnLCB0aGlzLmJpblBhdGgsIHRoaXMucGFyYW1zKTtcbiAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHtcbiAgICAgICAgICAgIHVpZDogdGhpcy5uYW1lLFxuICAgICAgICAgICAgc2NyaXB0OiAnU3Bhd25lcicsXG4gICAgICAgICAgICBiaW46IHRoaXMuYmluUGF0aCxcbiAgICAgICAgICAgIHBhcmFtczogdGhpcy5wYXJhbXNcbiAgICAgICAgfSk7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnTGF1bmNoaW5nIG5ldyBwcm9jZXNzJyk7XG4gICAgICAgIHRoaXMuY2hpbGQgPSBjaGlsZF9wcm9jZXNzLnNwYXduKHRoaXMuYmluUGF0aCwgdGhpcy5wYXJhbXMsIHsgc3RkaW86IFswLCAxLCAyXSB9KTtcbiAgICAgICAgdGhpcy5jaGlsZC5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBkZWJ1ZyhfdGhpcy5uYW1lLCAndGhpcy5jaGlsZC5vbkVycm9yICcsIGVycik7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoeyBlcnI6IGVyciB9LCAndGhpcy5jaGlsZC5vbkVycm9yJyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNoaWxkLm9uKCdjbG9zZScsIGZ1bmN0aW9uIChjb2RlLCBzaWduYWwpIHtcbiAgICAgICAgICAgIGRlYnVnKF90aGlzLm5hbWUsICd0aGlzLmNoaWxkLm9uQ2xvc2UnLCBjb2RlLCBzaWduYWwpO1xuICAgICAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAocmVsYXVuY2hPbkVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnKCdyZWxhdW5jaGluZycpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5sYXVuY2gocmVsYXVuY2hPbkVycm9yLCBvblN0ZEVyciwgb25DbG9zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9uQ2xvc2UoY29kZSwgc2lnbmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb25DbG9zZShjb2RlLCBudWxsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkLnBpZDtcbiAgICB9O1xuICAgIFNwYXduZXIucHJvdG90eXBlLmV4aXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGRlYnVnKHRoaXMubmFtZSwgJ2V4aXQoKSBpbnZva2VkJyk7XG4gICAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuY2hpbGQua2lsbCgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBTcGF3bmVyO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFNwYXduZXI7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zcGF3bmVyLnRzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGlsZF9wcm9jZXNzXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiY2hpbGRfcHJvY2Vzc1wiXG4vLyBtb2R1bGUgaWQgPSAxOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImZzXCJcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidG1wXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwidG1wXCJcbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcbnZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pbycpO1xudmFyIGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG52YXIgYnJpZGdlX1Bvb2xfMSA9IHJlcXVpcmUoJy4vYnJpZGdlX1Bvb2wnKTtcbnZhciBNRVNTQUdFU18xID0gcmVxdWlyZSgnLi9NRVNTQUdFUycpO1xudmFyIGNhY2hlXzEgPSByZXF1aXJlKFwiLi9jYWNoZVwiKTtcbnZhciBzZXJ2ZXJMb2dfMSA9IHJlcXVpcmUoJy4vc2VydmVyTG9nJyk7XG52YXIgcHJlYm9vdCA9IHJlcXVpcmUoJ3ByZWJvb3QnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ25nU2VydmVyLUJyaWRnZV9TMicpO1xudmFyIEJyaWRnZV9TMiA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnJpZGdlX1MyKHBvcnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5wcmVib290ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaHR0cFNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICAgICAgICAgICAgZGVidWcoJ3JlcXVlc3RpbmcgJywgcmVxLnVybCk7XG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwgeyAnQ29udGVudC1UeXBlJzogJ3RleHQvaHRtbCcgfSk7XG4gICAgICAgICAgICByZXMuZW5kKCdGb3JiaWRkZW4nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc29ja2V0U2VydmVyID0gaW8ubGlzdGVuKHRoaXMuaHR0cFNlcnZlciwge1xuICAgICAgICAgICAgYWxsb3dSZXF1ZXN0OiBmdW5jdGlvbiAoaGFuZHNoYWtlLCBjYikge1xuICAgICAgICAgICAgICAgIGRlYnVnKGhhbmRzaGFrZS5fcXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZHNoYWtlLl9xdWVyeS50b2tlbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW2hhbmRzaGFrZS5fcXVlcnkudG9rZW5dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNiKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5odHRwU2VydmVyLmxpc3Rlbihwb3J0KTtcbiAgICAgICAgdGhpcy5zb2NrZXRTZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgICAgICBkZWJ1ZygnYnJpZGdlX2ludGVybmFsIG5ldyBjb25uZWN0aW9uJyk7XG4gICAgICAgICAgICBzb2NrZXQub24oTUVTU0FHRVNfMS5NU0cuTE9HLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdnb2luZyB0byBsb2cgdHlwZSAvIGFyZ3MgJywgZGF0YS50eXBlLCBkYXRhLmFyZ3MpO1xuICAgICAgICAgICAgICAgIHZhciBsb2dnZXIgPSBzZXJ2ZXJMb2dfMS5kZWZhdWx0LldlYkFwcExvZy5jaGlsZCh7IHVpZDogZGF0YS51aWQsIHNjcmlwdDogJ0VFRScgfSk7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGV2JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci50cmFjZShkYXRhLmFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RlYnVnJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhkYXRhLmFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2xvZyc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oZGF0YS5hcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGRhdGEuYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGRhdGEuYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNvY2tldC5vbihNRVNTQUdFU18xLk1TRy5FUlJPUiwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHZhciBlcnJvck9iamVjdCA9IEpTT04ucGFyc2UoZXJyKTtcbiAgICAgICAgICAgICAgICBkZWJ1ZygnREREX01TR19FUlJPUiByZWNlaXZlZCcsIGVycm9yT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBzZXJ2ZXJMb2dfMS5kZWZhdWx0LkxvZy5jaGlsZCh7IHVpZDogZXJyb3JPYmplY3QudWlkLCBzY3JpcHQ6ICdCcmlkZ2VfUzInIH0pLmVycm9yKGVycm9yT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdChNRVNTQUdFU18xLk1TRy5FUlJPUiArIGVycm9yT2JqZWN0LnVpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNvY2tldC5vbihNRVNTQUdFU18xLk1TRy5JRExFLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZygncmVjZWl2ZWQgSURMRSBmcm9tIEVFRScsIHJlc3BvbnNlLnVpZCwgcmVzcG9uc2UudXJsLCByZXNwb25zZS5odG1sLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgZGVidWcoJ3Jlc3BvbnNlQ2FjaGUgPSAnLCByZXNwb25zZS5leHBvcnRlZENhY2hlKTtcbiAgICAgICAgICAgICAgICB2YXIgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLmV4cG9ydGVkQ2FjaGUpO1xuICAgICAgICAgICAgICAgIHZhciBzY3JpcHQgPSBcIjxzY3JpcHQgdHlwZT1cXFwidGV4dC9qYXZhc2NyaXB0XFxcIj53aW5kb3cubmdTZXJ2ZXJDYWNoZSA9IFwiICsgc2VyaWFsaXplZCArIFwiOzwvc2NyaXB0PjwvaGVhZD5cIjtcbiAgICAgICAgICAgICAgICB2YXIgc3VwZXJIVE1MID0gcmVzcG9uc2UuaHRtbC5yZXBsYWNlKC88XFwvaGVhZD4vLCBzY3JpcHQpO1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5wcmVib290KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmVib290T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcFJvb3Q6ICdkb2N1bWVudC5ib2R5J1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5saW5lUHJlYm9vdENvZGUgPSAnPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCI+JyArIHByZWJvb3QuZ2V0SW5saW5lQ29kZShwcmVib290T3B0aW9ucykgKyAnPC9zY3JpcHQ+PC9ib2R5Pic7XG4gICAgICAgICAgICAgICAgICAgIHN1cGVySFRNTCA9IHN1cGVySFRNTC5yZXBsYWNlKC88XFwvYm9keT4vLCBpbmxpbmVQcmVib290Q29kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChicmlkZ2VfUG9vbF8xLmRlZmF1bHQucG9vbFtyZXNwb25zZS51aWRdLnF1ZXJ5LnN0cmF0ZWd5ID09PSBNRVNTQUdFU18xLkVOVU1fQ0FDSEVfU1RBVFVTLlJFTkRFUl9DQUNIRSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VXJsID0gbmV3IGNhY2hlXzEuVXJsQ2FjaGUoYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbcmVzcG9uc2UudWlkXS5xdWVyeS51cmwpO1xuICAgICAgICAgICAgICAgICAgICBuZXdVcmwuc2V0KHN1cGVySFRNTCwge30sIGZ1bmN0aW9uIChlcnIsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHsgdWlkOiByZXNwb25zZS51aWQsIHNjcmlwdDogJ0JyaWRnZV9TMicgfSkuZXJyb3IoeyByZXNwb25zZTogcmVzcG9uc2UsIGVycjogZXJyIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdDYWNoZSBvbiBCcmlkZ2VfTVNHXzIuQ0FDSEVfSVQgc3RhdHVzID0gJywgc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5zZW5kSFRNTF90b19DbGllbnQocmVzcG9uc2UudWlkLCBzdXBlckhUTUwpO1xuICAgICAgICAgICAgICAgIHNvY2tldC5lbWl0KE1FU1NBR0VTXzEuTVNHLklETEUgKyByZXNwb25zZS51aWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ2JyaWRnZV9pbnRlcm5hbCAgZGVjb25uZWN0ZWQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgQnJpZGdlX1MyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHRoaXMuc29ja2V0U2VydmVyLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuaHR0cFNlcnZlci5jbG9zZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYigpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBCcmlkZ2VfUzI7XG59KCkpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gQnJpZGdlX1MyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvYnJpZGdlX1MyLnRzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJodHRwXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiaHR0cFwiXG4vLyBtb2R1bGUgaWQgPSAyM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG52YXIgTUVTU0FHRVNfMSA9IHJlcXVpcmUoJy4vTUVTU0FHRVMnKTtcbnZhciByZWRpc191cmxfY2FjaGVfMSA9IHJlcXVpcmUoJ3JlZGlzLXVybC1jYWNoZScpO1xudmFyIHZhbGlkYXRvcnNfMSA9IHJlcXVpcmUoJy4vdmFsaWRhdG9ycycpO1xudmFyIHNlcnZlckxvZ18xID0gcmVxdWlyZSgnLi9zZXJ2ZXJMb2cnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIHlhbWwgPSByZXF1aXJlKCdqcy15YW1sJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnbmdTZXJ2ZXItQ2FjaGUnKTtcbnZhciBDYWNoZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FjaGUoY29uZmlnRGlyLCBjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgc2VydmVyQ29uZmlncGF0aCA9IHBhdGguam9pbihjb25maWdEaXIsICdzZXJ2ZXJDb25maWcueW1sJyk7XG4gICAgICAgIHRoaXMuc2VydmVyQ29uZmlnID0geWFtbC5sb2FkKGZzLnJlYWRGaWxlU3luYyhzZXJ2ZXJDb25maWdwYXRoLCAndXRmOCcpKTtcbiAgICAgICAgdmFyIHJlbmRlclJ1bGVzUGF0aCA9IHBhdGguam9pbihjb25maWdEaXIsICdzZXJ2ZXJSZW5kZXJSdWxlcy55bWwnKTtcbiAgICAgICAgdGhpcy5yZW5kZXJSdWxlcyA9IHZhbGlkYXRvcnNfMS5kZWZhdWx0LnVuc2VyaWFsaXplU2VydmVyUnVsZXMoeWFtbC5sb2FkKGZzLnJlYWRGaWxlU3luYyhyZW5kZXJSdWxlc1BhdGgsICd1dGY4JykpKTtcbiAgICAgICAgdmFyIGNhY2hlUnVsZXNQYXRoID0gcGF0aC5qb2luKGNvbmZpZ0RpciwgJ3NlcnZlckNhY2hlUnVsZXMueW1sJyk7XG4gICAgICAgIHRoaXMuY2FjaGVSdWxlcyA9IHJlZGlzX3VybF9jYWNoZV8xLkNhY2hlRW5naW5lQ0IuaGVscGVycy51bnNlcmlhbGl6ZUNhY2hlUnVsZXMoeWFtbC5sb2FkKGZzLnJlYWRGaWxlU3luYyhjYWNoZVJ1bGVzUGF0aCwgJ3V0ZjgnKSkpO1xuICAgICAgICByZWRpc191cmxfY2FjaGVfMS5DYWNoZUNyZWF0b3IuY3JlYXRlQ2FjaGUoJ1NFUlZFUicsIHRydWUsIHRoaXMuc2VydmVyQ29uZmlnLnJlZGlzQ29uZmlnLCB0aGlzLmNhY2hlUnVsZXMsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZygnU29tZSBlcnJvcjogJywgZXJyKTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVXJsQ2FjaGUubG9hZENhY2hlRW5naW5lKF90aGlzLnNlcnZlckNvbmZpZy5kb21haW4sICdTRVJWRVInLCBfdGhpcy5zZXJ2ZXJDb25maWcucmVkaXNDb25maWcsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb2dnZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2IobnVsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIENhY2hlLnByb3RvdHlwZS5jaGVja1VSTCA9IGZ1bmN0aW9uICh1cmwsIGNiKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMubG9nZ2VyID0gc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoe1xuICAgICAgICAgICAgc2NyaXB0OiAnQ2FjaGUnLFxuICAgICAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdGhpcy5zaG91bGRSZW5kZXIodXJsKSkge1xuICAgICAgICAgICAgY2IoTUVTU0FHRVNfMS5NU0cuQU5TV0VSLCB7IHN0YXR1czogTUVTU0FHRVNfMS5FTlVNX0NBQ0hFX1NUQVRVUy5OT19SRU5ERVIgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgYmJiX3VybF8xID0gbmV3IFVybENhY2hlKHVybCk7XG4gICAgICAgICAgICBpZiAoYmJiX3VybF8xLnNob3VsZENhY2hlKCkpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZygnU2hvdWxkIGNhY2hlJyk7XG4gICAgICAgICAgICAgICAgYmJiX3VybF8xLmhhcyhmdW5jdGlvbiAoZXJyLCBpc0NhY2hlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb2dnZXIuZXJyb3IobmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoJ0Vycm9yIGhhcHBlbmVkLCAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKE1FU1NBR0VTXzEuTVNHLkFOU1dFUiwgeyBzdGF0dXM6IE1FU1NBR0VTXzEuRU5VTV9DQUNIRV9TVEFUVVMuRVJST1IsIGVycjogZXJyIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNDYWNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdpcyBub3QgY2FjaGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoTUVTU0FHRVNfMS5NU0cuQU5TV0VSLCB7IHN0YXR1czogTUVTU0FHRVNfMS5FTlVNX0NBQ0hFX1NUQVRVUy5SRU5ERVJfQ0FDSEUgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnaXMgY2FjaGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYmJfdXJsXzEuZ2V0KGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb2dnZXIuZXJyb3IobmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoJ0Vycm9yIGhhcHBlbmVkLCAnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoTUVTU0FHRVNfMS5NU0cuQU5TV0VSLCB7IHN0YXR1czogTUVTU0FHRVNfMS5FTlVNX0NBQ0hFX1NUQVRVUy5FUlJPUiwgZXJyOiBlcnIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKE1FU1NBR0VTXzEuTVNHLkFOU1dFUiwgeyBzdGF0dXM6IE1FU1NBR0VTXzEuRU5VTV9DQUNIRV9TVEFUVVMuSFRNTCwgaHRtbDogcmVzdWx0LmNvbnRlbnQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ3Nob3VsZCBub3QgY2FjaGUnKTtcbiAgICAgICAgICAgICAgICBjYihNRVNTQUdFU18xLk1TRy5BTlNXRVIsIHsgc3RhdHVzOiBNRVNTQUdFU18xLkVOVU1fQ0FDSEVfU1RBVFVTLlJFTkRFUl9OT19DQUNIRSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgQ2FjaGUucHJvdG90eXBlLnNob3VsZFJlbmRlciA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgdmFyIGksIHJlZ2V4O1xuICAgICAgICBkZWJ1Zygnc2hvdWxkUmVuZGVyIGNhbGxlZCB3aXRoIHVybCwgcmVuZGVyQ29uZmlnICcsIHVybCwgdGhpcy5yZW5kZXJSdWxlcyk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5yZW5kZXJSdWxlcy5zdHJhdGVneSkge1xuICAgICAgICAgICAgY2FzZSAnbmV2ZXInOlxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgJ2Fsd2F5cyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlICdpbmNsdWRlJzpcbiAgICAgICAgICAgICAgICBmb3IgKGkgaW4gdGhpcy5yZW5kZXJSdWxlcy5ydWxlcykge1xuICAgICAgICAgICAgICAgICAgICByZWdleCA9IHRoaXMucmVuZGVyUnVsZXMucnVsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KHVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgJ2V4Y2x1ZGUnOlxuICAgICAgICAgICAgICAgIGZvciAoaSBpbiB0aGlzLnJlbmRlclJ1bGVzLnJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2V4ID0gdGhpcy5yZW5kZXJSdWxlcy5ydWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZ2V4LnRlc3QodXJsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ2FjaGU7XG59KCkpO1xuZXhwb3J0cy5DYWNoZSA9IENhY2hlO1xudmFyIFVybENhY2hlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBVcmxDYWNoZSh1cmwpIHtcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICAgIHRoaXMuVVJMID0gVXJsQ2FjaGUuY2FjaGVFbmdpbmUudXJsKHVybCk7XG4gICAgfVxuICAgIFVybENhY2hlLmxvYWRDYWNoZUVuZ2luZSA9IGZ1bmN0aW9uIChkZWZhdWx0RG9tYWluLCBpbnN0YW5jZU5hbWUsIHJlZGlzQ29uZmlnLCBjYikge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgcmVkaXNfdXJsX2NhY2hlXzEuSW5zdGFuY2UoaW5zdGFuY2VOYW1lLCByZWRpc0NvbmZpZywge30sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICBVcmxDYWNoZS5jYWNoZUVuZ2luZSA9IG5ldyByZWRpc191cmxfY2FjaGVfMS5DYWNoZUVuZ2luZUNCKGRlZmF1bHREb21haW4sIGluc3RhbmNlKTtcbiAgICAgICAgICAgIGNiKG51bGwpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFVybENhY2hlLnByb3RvdHlwZS5zaG91bGRDYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuVVJMLmdldENhdGVnb3J5KCkgPT09ICduZXZlcicgPyBmYWxzZSA6IHRydWU7XG4gICAgfTtcbiAgICBVcmxDYWNoZS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHRoaXMuVVJMLmhhcyhjYik7XG4gICAgfTtcbiAgICBVcmxDYWNoZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHRoaXMuVVJMLmdldChjYik7XG4gICAgfTtcbiAgICBVcmxDYWNoZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGNvbnRlbnQsIGV4dHJhLCBjYikge1xuICAgICAgICB0aGlzLlVSTC5zZXQoY29udGVudCwgZXh0cmEsIGZhbHNlLCBjYik7XG4gICAgfTtcbiAgICByZXR1cm4gVXJsQ2FjaGU7XG59KCkpO1xuZXhwb3J0cy5VcmxDYWNoZSA9IFVybENhY2hlO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvY2FjaGUudHNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xudmFyIHJlZGlzX3VybF9jYWNoZV8xID0gcmVxdWlyZSgncmVkaXMtdXJsLWNhY2hlJyk7XG52YXIgVmFsaWRhdG9ycyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVmFsaWRhdG9ycygpIHtcbiAgICB9XG4gICAgVmFsaWRhdG9ycy51bnNlcmlhbGl6ZVNlcnZlclJ1bGVzID0gZnVuY3Rpb24gKHJ1bGVzKSB7XG4gICAgICAgIHZhciBpbmRleCwgcmVnZXg7XG4gICAgICAgIGZvciAoaW5kZXggaW4gcnVsZXMucnVsZXMpIHtcbiAgICAgICAgICAgIHJlZ2V4ID0gcmVkaXNfdXJsX2NhY2hlXzEuQ2FjaGVFbmdpbmVDQi5oZWxwZXJzLnVuc2VyaWFsaXplUmVnZXgocnVsZXMucnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICAgIHJ1bGVzLnJ1bGVzW2luZGV4XSA9IHJlZ2V4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydWxlcztcbiAgICB9O1xuICAgIHJldHVybiBWYWxpZGF0b3JzO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFZhbGlkYXRvcnM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy92YWxpZGF0b3JzLnRzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwcmVib290XCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicHJlYm9vdFwiXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9