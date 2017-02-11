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
	                    debug('CHECK_URL result', status, data);
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
	            debug('Existing slimerProcess with data', bridge_Pool_1.default.pool[this.uid]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDk2ZTFlYzU0MDliODQxODgwNjMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3RlclByb2Nlc3MudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImZzLWV4dHJhXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXN5bmNcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqcy15YW1sXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwicmVkaXMtdXJsLWNhY2hlXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlcnZlckxvZy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJidW55YW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJnZWxmLXN0cmVhbVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImRlYnVnXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY2RuLXNlcnZlclwiIiwid2VicGFjazovLy8uL3NyYy9icmlkZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JyaWRnZV9TMS50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJzb2NrZXQuaW9cIiIsIndlYnBhY2s6Ly8vLi9zcmMvYnJpZGdlX1Bvb2wudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwibm9kZS11dWlkXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL01FU1NBR0VTLnRzIiwid2VicGFjazovLy8uL3NyYy9zbGltZXJQcm9jZXNzLnRzIiwid2VicGFjazovLy8uL3NyYy9zcGF3bmVyLnRzIiwid2VicGFjazovLy9leHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInRtcFwiIiwid2VicGFjazovLy8uL3NyYy9icmlkZ2VfUzIudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiaHR0cFwiIiwid2VicGFjazovLy8uL3NyYy9jYWNoZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdmFsaWRhdG9ycy50cyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwcmVib290XCIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUI7QUFDckIsa0JBQWlCO0FBQ2pCO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7Ozs7Ozs7QUMzRkEsa0M7Ozs7OztBQ0FBLHNDOzs7Ozs7QUNBQSxtQzs7Ozs7O0FDQUEscUM7Ozs7OztBQ0FBLDZDOzs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0QsK0NBQThDLGNBQWM7QUFDNUQ7Ozs7Ozs7QUNsR0EsdUM7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUMsZ0VBQWdFO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDLDhEQUE4RDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUMsZ0VBQWdFO0FBQ2pFO0FBQ0E7Ozs7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTLFNBQVMsdUJBQXVCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRCwrQ0FBOEMsY0FBYztBQUM1RDs7Ozs7OztBQ3ZGQTtBQUNB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O0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9GQUFtRjtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEOzs7Ozs7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0QsK0NBQThDLGNBQWM7QUFDNUQ7Ozs7Ozs7QUNoQkEscUMiLCJmaWxlIjoibmctc2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNDk2ZTFlYzU0MDliODQxODgwNjMiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbnZhciBhc3luYyA9IHJlcXVpcmUoJ2FzeW5jJyk7XG52YXIgeWFtbCA9IHJlcXVpcmUoJ2pzLXlhbWwnKTtcbnZhciByZWRpc191cmxfY2FjaGVfMSA9IHJlcXVpcmUoJ3JlZGlzLXVybC1jYWNoZScpO1xudmFyIHNlcnZlckxvZ18xID0gcmVxdWlyZSgnLi9zZXJ2ZXJMb2cnKTtcbnZhciBjZG5fc2VydmVyXzEgPSByZXF1aXJlKCdjZG4tc2VydmVyJyk7XG52YXIgYnJpZGdlXzEgPSByZXF1aXJlKCcuL2JyaWRnZScpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnbmdTZXJ2ZXInKTtcbnZhciBNYXN0ZXJQcm9jZXNzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNYXN0ZXJQcm9jZXNzKGNvbmZpZ0Rpcikge1xuICAgICAgICB0aGlzLmNvbmZpZ0RpciA9IGNvbmZpZ0RpcjtcbiAgICAgICAgZGVidWcoJ0RJUk5BTUUgPSAnLCBfX2Rpcm5hbWUpO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoY29uZmlnRGlyKSkge1xuICAgICAgICAgICAgdGhyb3cgXCJUaGUgY29uZmlnIGRpciBkb2Vzbid0IGV4aXN0cyBcIiArIGNvbmZpZ0RpcjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29uZmlnUGF0aDtcbiAgICAgICAgWydzZXJ2ZXJDb25maWcueW1sJywgJ3NlcnZlclJlbmRlclJ1bGVzLnltbCcsICdzZXJ2ZXJDYWNoZVJ1bGVzLnltbCcsICdzbGltZXJSZXN0Q2FjaGVSdWxlcy55bWwnXS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBjb25maWdQYXRoID0gcGF0aC5qb2luKGNvbmZpZ0RpciwgaXRlbSk7XG4gICAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoY29uZmlnUGF0aCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjb25maWcgZmlsZSAnICsgY29uZmlnUGF0aCArICcgZG9lc250IGV4aXN0cycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeWFtbC5sb2FkKGZzLnJlYWRGaWxlU3luYyhjb25maWdQYXRoLCAndXRmOCcpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2VydmVyQ29uZmlnID0geWFtbC5sb2FkKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5jb25maWdEaXIsICdzZXJ2ZXJDb25maWcueW1sJyksICd1dGY4JykpO1xuICAgICAgICBkZWJ1Zygnc2VydmVyQ29uZmlnICAnLCB0aGlzLnNlcnZlckNvbmZpZyk7XG4gICAgICAgIHNlcnZlckxvZ18xLmRlZmF1bHQuaW5pdExvZ3ModGhpcy5zZXJ2ZXJDb25maWcubG9nQmFzZVBhdGgsIHRoaXMuc2VydmVyQ29uZmlnLmdlbGYpO1xuICAgICAgICBzZXJ2ZXJMb2dfMS5kZWZhdWx0LkxvZy5pbmZvKCdNYXN0ZXIgc3RhcnRpbmcnKTtcbiAgICB9XG4gICAgTWFzdGVyUHJvY2Vzcy5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHNsaW1lclJlc3RDYWNoZU1vZHVsZVBhdGggPSBwYXRoLmpvaW4odGhpcy5jb25maWdEaXIsICdzbGltZXJSZXN0Q2FjaGVSdWxlcy55bWwnKTtcbiAgICAgICAgdmFyIGNhY2hlUnVsZXMgPSB7XG4gICAgICAgICAgICBTbGltZXJfUmVzdDogcmVkaXNfdXJsX2NhY2hlXzEuQ2FjaGVFbmdpbmVDQi5oZWxwZXJzLnVuc2VyaWFsaXplQ2FjaGVSdWxlcyh5YW1sLmxvYWQoZnMucmVhZEZpbGVTeW5jKHNsaW1lclJlc3RDYWNoZU1vZHVsZVBhdGgsICd1dGY4JykpKVxuICAgICAgICB9O1xuICAgICAgICB2YXIgcGFycmFsbGVsRm5zID0ge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBjYWNoZVJ1bGVzKSB7XG4gICAgICAgICAgICBwYXJyYWxsZWxGbnNba2V5XSA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICAgICAgICAgIHJlZGlzX3VybF9jYWNoZV8xLkNhY2hlQ3JlYXRvci5jcmVhdGVDYWNoZShrZXkudG9VcHBlckNhc2UoKSwgdHJ1ZSwgX3RoaXMuc2VydmVyQ29uZmlnLnJlZGlzQ29uZmlnLCBjYWNoZVJ1bGVzW2tleV0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjYihudWxsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcoJ1N0YXJ0aW5nJyk7XG4gICAgICAgIGFzeW5jLnBhcmFsbGVsKHBhcnJhbGxlbEZucywgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuYnJpZGdlID0gbmV3IGJyaWRnZV8xLmRlZmF1bHQoX3RoaXMuY29uZmlnRGlyKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5icmlkZ2Uuc3RhcnQoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxhdW5jaENETlNlcnZlcihmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgTWFzdGVyUHJvY2Vzcy5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmJyaWRnZS5zdG9wKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLmNkblNlcnZlci5zdG9wKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgTWFzdGVyUHJvY2Vzcy5wcm90b3R5cGUubGF1bmNoQ0ROU2VydmVyID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIHZhciBjYWNoZVJ1bGVzID0gcmVkaXNfdXJsX2NhY2hlXzEuQ2FjaGVFbmdpbmVDQi5oZWxwZXJzLnVuc2VyaWFsaXplQ2FjaGVSdWxlcyh5YW1sLmxvYWQoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0aGlzLmNvbmZpZ0RpciwgJ3NsaW1lclJlc3RDYWNoZVJ1bGVzLnltbCcpLCAndXRmOCcpKSk7XG4gICAgICAgIHZhciBjZG5Db25maWcgPSB7XG4gICAgICAgICAgICBkZWZhdWx0RG9tYWluOiB0aGlzLnNlcnZlckNvbmZpZy5kb21haW4sXG4gICAgICAgICAgICBwb3J0OiB0aGlzLnNlcnZlckNvbmZpZy5zb2NrZXRTZXJ2ZXJzLnByb3h5LnBvcnQsXG4gICAgICAgICAgICBpbnN0YW5jZU5hbWU6ICdTTElNRVJfUkVTVCcsXG4gICAgICAgICAgICByZWRpc0NvbmZpZzogdGhpcy5zZXJ2ZXJDb25maWcucmVkaXNDb25maWcsXG4gICAgICAgICAgICBjYWNoZVJ1bGVzOiBjYWNoZVJ1bGVzXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2RuU2VydmVyID0gbmV3IGNkbl9zZXJ2ZXJfMS5DYWNoZVNlcnZlcihjZG5Db25maWcsIHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHtcbiAgICAgICAgICAgIHNjcmlwdDogJ0NhY2hlU2VydmVyJ1xuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuY2RuU2VydmVyLnN0YXJ0KGNiKTtcbiAgICB9O1xuICAgIHJldHVybiBNYXN0ZXJQcm9jZXNzO1xufSgpKTtcbm1vZHVsZS5leHBvcnRzID0gTWFzdGVyUHJvY2VzcztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21hc3RlclByb2Nlc3MudHNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInBhdGhcIlxuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmcy1leHRyYVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImZzLWV4dHJhXCJcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYXN5bmNcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJhc3luY1wiXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImpzLXlhbWxcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJqcy15YW1sXCJcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVkaXMtdXJsLWNhY2hlXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwicmVkaXMtdXJsLWNhY2hlXCJcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgYnVueWFuID0gcmVxdWlyZSgnYnVueWFuJyk7XG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG52YXIgZ2VsZlN0cmVhbSA9IHJlcXVpcmUoJ2dlbGYtc3RyZWFtJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCduZ1NlcnZlci1zZXJ2ZXJMb2cnKTtcbnZhciBTZXJ2ZXJMb2cgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlcnZlckxvZygpIHtcbiAgICB9XG4gICAgU2VydmVyTG9nLnBvb2xTZXJpYWxpemVyID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHF1ZXJ5OiBlbGVtLnF1ZXJ5LFxuICAgICAgICAgICAgc3RhdHVzOiBlbGVtLnN0YXR1cyxcbiAgICAgICAgICAgIGJlbmNobWFyazogZWxlbS5iZW5jaG1hcmssXG4gICAgICAgICAgICBzcGF3bmVyOiB0eXBlb2YgZWxlbS5zcGF3bmVyICE9PSAndW5kZWZpbmVkJyA/IGVsZW0uc3Bhd25lci5nZXRTcGF3bmVyKCkgOiBudWxsXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBTZXJ2ZXJMb2cuaW5pdExvZ3MgPSBmdW5jdGlvbiAoYmFzZVBhdGgsIGdlbGYpIHtcbiAgICAgICAgdmFyIGxvZ1BhdGggPSBiYXNlUGF0aDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLmVuc3VyZURpclN5bmMobG9nUGF0aCk7XG4gICAgICAgICAgICBmcy5jaG1vZFN5bmMobG9nUGF0aCwgJzc3NycpO1xuICAgICAgICAgICAgZGVidWcobG9nUGF0aCArIFwiIGlzIHVzZWQgdG8gc3RvcmUgbG9nIEZpbGVzXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBkZWJ1ZyhcIkNBTk5PVCBjcmVhdGUgbG9nIFwiICsgbG9nUGF0aCk7XG4gICAgICAgICAgICBsb2dQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgYmFzZVBhdGgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGxvZ1BhdGgpO1xuICAgICAgICAgICAgICAgIGZzLmNobW9kU3luYyhsb2dQYXRoLCAnNzc3Jyk7XG4gICAgICAgICAgICAgICAgZGVidWcobG9nUGF0aCArIFwiIGlzIHVzZWQgdG8gc3RvcmUgbG9nIEZpbGVzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhlKTtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhcIkNBTk5PVCBjcmVhdGUgbG9nIFwiICsgbG9nUGF0aCk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBhcHBTdHJlYW1zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxldmVsOiAndHJhY2UnLFxuICAgICAgICAgICAgICAgIHBhdGg6IHBhdGguam9pbihsb2dQYXRoLCAndHJhY2UubG9nJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4obG9nUGF0aCwgJ2luZm8ubG9nJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aC5qb2luKGxvZ1BhdGgsICdlcnJvci5sb2cnKVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgICB2YXIgd2ViQXBwU3RyZWFtcyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsZXZlbDogJ3RyYWNlJyxcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoLmpvaW4obG9nUGF0aCwgJ3dlYi1hcHAubG9nJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgICAgICAgICAgcGF0aDogcGF0aC5qb2luKGxvZ1BhdGgsICd3ZWItYXBwLWVycm9yLmxvZycpXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgICAgIGlmIChnZWxmLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHZhciBzdHJlYW0gPSBnZWxmU3RyZWFtLmZvckJ1bnlhbihnZWxmLmhvc3QsIGdlbGYucG9ydCk7XG4gICAgICAgICAgICBhcHBTdHJlYW1zLnB1c2goe1xuICAgICAgICAgICAgICAgIHN0cmVhbTogc3RyZWFtLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdyYXcnLFxuICAgICAgICAgICAgICAgIGxldmVsOiAndHJhY2UnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdlYkFwcFN0cmVhbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgc3RyZWFtOiBzdHJlYW0sXG4gICAgICAgICAgICAgICAgdHlwZTogJ3JhdycsXG4gICAgICAgICAgICAgICAgbGV2ZWw6ICd0cmFjZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFNlcnZlckxvZy5Mb2cgPSBidW55YW4uY3JlYXRlTG9nZ2VyKHtcbiAgICAgICAgICAgIG5hbWU6ICdTZXJ2ZXJMb2cnLFxuICAgICAgICAgICAgc3RyZWFtczogYXBwU3RyZWFtcyxcbiAgICAgICAgICAgIHNlcmlhbGl6ZXJzOiBidW55YW4uc3RkU2VyaWFsaXplcnNcbiAgICAgICAgfSk7XG4gICAgICAgIFNlcnZlckxvZy5Mb2cuYWRkU2VyaWFsaXplcnMoe1xuICAgICAgICAgICAgcG9vbDogU2VydmVyTG9nLnBvb2xTZXJpYWxpemVyXG4gICAgICAgIH0pO1xuICAgICAgICBTZXJ2ZXJMb2cuV2ViQXBwTG9nID0gYnVueWFuLmNyZWF0ZUxvZ2dlcih7XG4gICAgICAgICAgICBuYW1lOiBcIldlYkFwcFwiLFxuICAgICAgICAgICAgc3RyZWFtczogd2ViQXBwU3RyZWFtcyxcbiAgICAgICAgICAgIHNlcmlhbGl6ZXJzOiBidW55YW4uc3RkU2VyaWFsaXplcnNcbiAgICAgICAgfSk7XG4gICAgICAgIFNlcnZlckxvZy5XZWJBcHBMb2cuYWRkU2VyaWFsaXplcnMoe1xuICAgICAgICAgICAgcG9vbDogU2VydmVyTG9nLnBvb2xTZXJpYWxpemVyXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIFNlcnZlckxvZztcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTZXJ2ZXJMb2c7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zZXJ2ZXJMb2cudHNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYnVueWFuXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiYnVueWFuXCJcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZ2VsZi1zdHJlYW1cIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJnZWxmLXN0cmVhbVwiXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImRlYnVnXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiZGVidWdcIlxuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjZG4tc2VydmVyXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiY2RuLXNlcnZlclwiXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBicmlkZ2VfUzFfMSA9IHJlcXVpcmUoJy4vYnJpZGdlX1MxJyk7XG52YXIgYnJpZGdlX1MyXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9TMicpO1xudmFyIGJyaWRnZV9Qb29sXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9Qb29sJyk7XG52YXIgY2FjaGVfMSA9IHJlcXVpcmUoXCIuL2NhY2hlXCIpO1xudmFyIHNlcnZlckxvZ18xID0gcmVxdWlyZSgnLi9zZXJ2ZXJMb2cnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIHlhbWwgPSByZXF1aXJlKCdqcy15YW1sJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xudmFyIEJyaWRnZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnJpZGdlKGNvbmZpZ0Rpcikge1xuICAgICAgICB0aGlzLmNvbmZpZ0RpciA9IGNvbmZpZ0RpcjtcbiAgICAgICAgdmFyIHNlcnZlckNvbmZpZ3BhdGggPSBwYXRoLmpvaW4oY29uZmlnRGlyLCAnc2VydmVyQ29uZmlnLnltbCcpO1xuICAgICAgICB0aGlzLnNlcnZlckNvbmZpZyA9IHlhbWwubG9hZChmcy5yZWFkRmlsZVN5bmMoc2VydmVyQ29uZmlncGF0aCwgJ3V0ZjgnKSk7XG4gICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5pbml0KHRoaXMuc2VydmVyQ29uZmlnKTtcbiAgICAgICAgc2VydmVyTG9nXzEuZGVmYXVsdC5pbml0TG9ncyh0aGlzLnNlcnZlckNvbmZpZy5sb2dCYXNlUGF0aCwgdGhpcy5zZXJ2ZXJDb25maWcuZ2VsZik7XG4gICAgfVxuICAgIEJyaWRnZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoY2IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHsgc2NyaXB0OiAnQnJpZGdlJyB9KTtcbiAgICAgICAgdmFyIGNhY2hlID0gbmV3IGNhY2hlXzEuQ2FjaGUodGhpcy5jb25maWdEaXIsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIF90aGlzLkJyaWRnZV9TMSA9IG5ldyBicmlkZ2VfUzFfMS5kZWZhdWx0KF90aGlzLnNlcnZlckNvbmZpZy5zb2NrZXRTZXJ2ZXJzLmJyaWRnZV9leHRlcm5hbC5wb3J0LCBjYWNoZSk7XG4gICAgICAgICAgICAgICAgX3RoaXMuQnJpZGdlX1MyID0gbmV3IGJyaWRnZV9TMl8xLmRlZmF1bHQoX3RoaXMuc2VydmVyQ29uZmlnLnNvY2tldFNlcnZlcnMuYnJpZGdlX2ludGVybmFsLnBvcnQpO1xuICAgICAgICAgICAgICAgIF90aGlzLkJyaWRnZV9TMi5wcmVib290ID0gX3RoaXMuc2VydmVyQ29uZmlnLnByZWJvb3Q7XG4gICAgICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgIGNiKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEJyaWRnZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB0aGlzLkJyaWRnZV9TMS5zdG9wKCk7XG4gICAgICAgIHRoaXMuQnJpZGdlX1MyLnN0b3AoY2IpO1xuICAgIH07XG4gICAgcmV0dXJuIEJyaWRnZTtcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBCcmlkZ2U7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9icmlkZ2UudHNcbi8vIG1vZHVsZSBpZCA9IDExXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcbnZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pbycpO1xudmFyIGJyaWRnZV9Qb29sXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9Qb29sJyk7XG52YXIgTUVTU0FHRVNfMSA9IHJlcXVpcmUoJy4vTUVTU0FHRVMnKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgdG1wID0gcmVxdWlyZSgndG1wJyk7XG52YXIgc2VydmVyTG9nXzEgPSByZXF1aXJlKCcuL3NlcnZlckxvZycpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnbmdTZXJ2ZXItQnJpZGdlX2V4dGVybmFsJyk7XG52YXIgQnJpZGdlX1MxID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCcmlkZ2VfUzEocG9ydCwgY2FjaGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5jYWNoZSA9IGNhY2hlO1xuICAgICAgICBkZWJ1ZygnZ29pbmcgdG8gbGlzdGVuIHRvIHBvcnQnLCBwb3J0KTtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBpby5saXN0ZW4ocG9ydCwge1xuICAgICAgICAgICAgYWxsb3dSZXF1ZXN0OiBmdW5jdGlvbiAoaGFuZHNoYWtlLCBjYikge1xuICAgICAgICAgICAgICAgIGNiKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgICAgICBkZWJ1ZygnQnJpZGdlX1MxIG5ldyBjb25uZWN0aW9uICcsIHNvY2tldC5pZCk7XG4gICAgICAgICAgICBCcmlkZ2VfUzEuc29ja2V0c1tzb2NrZXQuaWRdID0gc29ja2V0O1xuICAgICAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHtcbiAgICAgICAgICAgICAgICBzY3JpcHQ6ICdCcmlkZ2VfUzEnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNvY2tldC5vbihNRVNTQUdFU18xLk1TRy5HRVRfVVJMLCBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgICAgICBpZiAocXVlcnkuaHRtbCAmJiBxdWVyeS5odG1sLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkudG1wID0gX3RoaXMuY3JlYXRlVG1wRmlsZShxdWVyeS5odG1sKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHF1ZXJ5Lmh0bWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlYnVnKCdCcmlkZ2VfUzEgb24uQUFBX01TRy5HRVRfVVJMJywgcXVlcnkpO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1Zyh7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeVxuICAgICAgICAgICAgICAgIH0sICdCcmlkZ2VfUzEgb24uQUFBX01TRy5HRVRfVVJMJyk7XG4gICAgICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LmFkZFJlbmRlcihzb2NrZXQuaWQsIHF1ZXJ5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdCcmlkZ2VfUzEgZGlzY29ubmVjdGVkICcsIHNvY2tldC5pZCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIEJyaWRnZV9TMS5zb2NrZXRzW3NvY2tldC5pZF07XG4gICAgICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LmJyaWRnZUludGVybmFsU29ja2V0RGlzY29ubmVjdGVkKHNvY2tldC5pZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNvY2tldC5vbihNRVNTQUdFU18xLk1TRy5DSEVDS19VUkwsIGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZygnQUFBX01TRy5DSEVDS19VUkwnLCB1cmwpO1xuICAgICAgICAgICAgICAgIHZhciBsb2dnZXIgPSBzZXJ2ZXJMb2dfMS5kZWZhdWx0LkxvZy5jaGlsZCh7XG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdDogJ0JyaWRnZV9TMScsXG4gICAgICAgICAgICAgICAgICAgIHVybDogdXJsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdBQUFfTVNHLkNIRUNLX1VSTCcpO1xuICAgICAgICAgICAgICAgIF90aGlzLmNhY2hlLmNoZWNrVVJMKHVybCwgZnVuY3Rpb24gKHN0YXR1cywgZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnQ0hFQ0tfVVJMIHJlc3VsdCcsIHN0YXR1cywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1Zyh7IHN0YXR1czogc3RhdHVzLCBkYXRhOiBkYXRhIH0sICdBQUFfTVNHLkNIRUNLX1VSTCBSRVNQT05TRScpO1xuICAgICAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdChzdGF0dXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBCcmlkZ2VfUzEucHJvdG90eXBlLmNyZWF0ZVRtcEZpbGUgPSBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICB2YXIgZmlsZU9iaiA9IHRtcC5maWxlU3luYyh7IG1vZGU6IDc3NywgcHJlZml4OiAncHJlZml4LScsIHBvc3RmaXg6ICcuaHRtbCcgfSk7XG4gICAgICAgIGZzLndyaXRlU3luYyhmaWxlT2JqLmZkLCBodG1sLCAwLCAndXRmLTgnKTtcbiAgICAgICAgZnMuY2xvc2VTeW5jKGZpbGVPYmouZmQpO1xuICAgICAgICBmcy5jaG1vZFN5bmMoZmlsZU9iai5uYW1lLCAnMDc3NycpO1xuICAgICAgICByZXR1cm4gZmlsZU9iai5uYW1lO1xuICAgIH07XG4gICAgQnJpZGdlX1MxLm5vdGlmeUNsaWVudCA9IGZ1bmN0aW9uIChzb2NrZXRJRCwgdWlkLCBzdGF0dXMpIHtcbiAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHtcbiAgICAgICAgICAgIHNjcmlwdDogJ0JyaWRnZV9TMScsXG4gICAgICAgICAgICB1aWQ6IHVpZCxcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnN0YXR1c1xuICAgICAgICB9KTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdCcmlkZ2VfUzEgZW1pdC5CcmlkZ2VfTVNHXzEuUkVOREVSX1NUQVRVUycpO1xuICAgICAgICBCcmlkZ2VfUzEuc29ja2V0c1tzb2NrZXRJRF0uZW1pdChNRVNTQUdFU18xLk1TRy5SRU5ERVJfU1RBVFVTLCBzdGF0dXMpO1xuICAgIH07XG4gICAgQnJpZGdlX1MxLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNlcnZlci5jbG9zZSgpO1xuICAgIH07XG4gICAgQnJpZGdlX1MxLnNvY2tldHMgPSB7fTtcbiAgICByZXR1cm4gQnJpZGdlX1MxO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IEJyaWRnZV9TMTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2JyaWRnZV9TMS50c1xuLy8gbW9kdWxlIGlkID0gMTJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwic29ja2V0LmlvXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwic29ja2V0LmlvXCJcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcbnZhciB1dWlkID0gcmVxdWlyZSgnbm9kZS11dWlkJyk7XG52YXIgYnJpZGdlX1MxXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9TMScpO1xudmFyIE1FU1NBR0VTXzEgPSByZXF1aXJlKCcuL01FU1NBR0VTJyk7XG52YXIgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xudmFyIHNlcnZlckxvZ18xID0gcmVxdWlyZSgnLi9zZXJ2ZXJMb2cnKTtcbnZhciBzbGltZXJQcm9jZXNzXzEgPSByZXF1aXJlKFwiLi9zbGltZXJQcm9jZXNzXCIpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnbmdTZXJ2ZXItQnJpZGdlX1Bvb2wnKTtcbnZhciBCcmlkZ2VfUG9vbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQnJpZGdlX1Bvb2woKSB7XG4gICAgfVxuICAgIEJyaWRnZV9Qb29sLmluaXQgPSBmdW5jdGlvbiAoc2VydmVyQ29uZmlnKSB7XG4gICAgICAgIEJyaWRnZV9Qb29sLnNlcnZlckNvbmZpZyA9IHNlcnZlckNvbmZpZztcbiAgICB9O1xuICAgIEJyaWRnZV9Qb29sLmFkZFJlbmRlciA9IGZ1bmN0aW9uIChzb2NrZXRJZCwgcXVlcnkpIHtcbiAgICAgICAgdmFyIHVpZCA9IHV1aWQudjQoKTtcbiAgICAgICAgdmFyIGxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHsgdWlkOiB1aWQsIHNjcmlwdDogJ0JyaWRnZV9Qb29sJyB9KTtcbiAgICAgICAgZGVidWcoJ25ldyBVSUQgY2VyYXRlZDogJywgdWlkLCAnZm9yIHF1ZXJ5OiAnLCBxdWVyeSk7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbdWlkXSA9IHtcbiAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgICAgICAgIHNvY2tldElkOiBzb2NrZXRJZCxcbiAgICAgICAgICAgIHN0YXR1czogTUVTU0FHRVNfMS5FTlVNX1JFTkRFUl9TVEFUVVMuUVVFVUVELFxuICAgICAgICAgICAgZXhpdDogZmFsc2UsXG4gICAgICAgICAgICBiZW5jaG1hcms6IHtcbiAgICAgICAgICAgICAgICBxdWV1ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgc3RhcnRlZDogMCxcbiAgICAgICAgICAgICAgICBjbG9zZWQ6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKHsgcG9vbDogQnJpZGdlX1Bvb2wucG9vbFt1aWRdIH0sICduZXcgVUlEIGNyZWF0ZWQ6ICcgKyB1aWQpO1xuICAgICAgICBCcmlkZ2VfUG9vbC5vcmRlci5wdXNoKHVpZCk7XG4gICAgICAgIGlmIChCcmlkZ2VfUG9vbC5uZXh0KCkgIT09IHVpZCkge1xuICAgICAgICAgICAgQnJpZGdlX1Bvb2wubm90aWZ5QnJpZGdlSW50ZXJuYWwodWlkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKEJyaWRnZV9Qb29sLm9yZGVyLmxlbmd0aCA9PT0gMCB8fCBCcmlkZ2VfUG9vbC5vcmRlci5sZW5ndGggPT09IEJyaWRnZV9Qb29sLm1heENvbmN1cmVuY3kpIHtcbiAgICAgICAgICAgIHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHsgc2NyaXB0OiAnQnJpZGdlX1Bvb2wnIH0pLndhcm4oJ1RoZSBwcm9jZXNzaW5nIHBvb2wgaXMgbm93IGVtcHR5Jyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV4dFVJRCA9IEJyaWRnZV9Qb29sLm9yZGVyLnNoaWZ0KCk7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbbmV4dFVJRF0uc3RhdHVzID0gTUVTU0FHRVNfMS5FTlVNX1JFTkRFUl9TVEFUVVMuU1RBUlRFRDtcbiAgICAgICAgQnJpZGdlX1Bvb2wucG9vbFtuZXh0VUlEXS5iZW5jaG1hcmsuc3RhcnRlZCA9IERhdGUubm93KCk7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbbmV4dFVJRF0uc3Bhd25lciA9IG5ldyBzbGltZXJQcm9jZXNzXzEuZGVmYXVsdChuZXh0VUlEKTtcbiAgICAgICAgQnJpZGdlX1Bvb2wubm90aWZ5QnJpZGdlSW50ZXJuYWwobmV4dFVJRCk7XG4gICAgICAgIHJldHVybiBuZXh0VUlEO1xuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wuc2VuZEhUTUxfdG9fQ2xpZW50ID0gZnVuY3Rpb24gKHVpZCwgaHRtbCkge1xuICAgICAgICBCcmlkZ2VfUG9vbC5wb29sW3VpZF0uaHRtbCA9IGh0bWw7XG4gICAgICAgIEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zdGF0dXMgPSBNRVNTQUdFU18xLkVOVU1fUkVOREVSX1NUQVRVUy5IVE1MO1xuICAgICAgICBCcmlkZ2VfUG9vbC5ub3RpZnlCcmlkZ2VJbnRlcm5hbCh1aWQpO1xuICAgICAgICBpZiAoQnJpZGdlX1Bvb2wucG9vbFt1aWRdLmV4aXQpIHtcbiAgICAgICAgICAgIEJyaWRnZV9Qb29sLmRlbGV0ZVVJRCh1aWQpO1xuICAgICAgICAgICAgQnJpZGdlX1Bvb2wubmV4dCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBCcmlkZ2VfUG9vbC5ub3RpZnlCcmlkZ2VJbnRlcm5hbCA9IGZ1bmN0aW9uICh1aWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBCcmlkZ2VfUG9vbC5wb29sW3VpZF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zdGF0dXMgPT09IE1FU1NBR0VTXzEuRU5VTV9SRU5ERVJfU1RBVFVTLkhUTUwpIHtcbiAgICAgICAgICAgIGJyaWRnZV9TMV8xLmRlZmF1bHQubm90aWZ5Q2xpZW50KEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zb2NrZXRJZCwgdWlkLCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBNRVNTQUdFU18xLkVOVU1fUkVOREVSX1NUQVRVUy5IVE1MLFxuICAgICAgICAgICAgICAgIGh0bWw6IEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5odG1sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJyaWRnZV9TMV8xLmRlZmF1bHQubm90aWZ5Q2xpZW50KEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5zb2NrZXRJZCwgdWlkLCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBCcmlkZ2VfUG9vbC5wb29sW3VpZF0uc3RhdHVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wuYnJpZGdlSW50ZXJuYWxTb2NrZXREaXNjb25uZWN0ZWQgPSBmdW5jdGlvbiAoc29ja2V0SWQpIHtcbiAgICAgICAgZm9yICh2YXIgdWlkIGluIEJyaWRnZV9Qb29sLnBvb2wpIHtcbiAgICAgICAgICAgIGlmIChCcmlkZ2VfUG9vbC5wb29sW3VpZF0uc29ja2V0SWQgPT09IHNvY2tldElkKSB7XG4gICAgICAgICAgICAgICAgaWYgKEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5leGl0KSB7XG4gICAgICAgICAgICAgICAgICAgIEJyaWRnZV9Qb29sLmRlbGV0ZVVJRCh1aWQpO1xuICAgICAgICAgICAgICAgICAgICBCcmlkZ2VfUG9vbC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgQnJpZGdlX1Bvb2wuZGVsZXRlVUlEID0gZnVuY3Rpb24gKHVpZCkge1xuICAgICAgICBkZWJ1ZygnZGVsZXRpbmcgdWlkICcsIHVpZCk7XG4gICAgICAgIGlmIChCcmlkZ2VfUG9vbC5wb29sW3VpZF0ucXVlcnkudG1wKSB7XG4gICAgICAgICAgICBmcy5yZW1vdmVTeW5jKEJyaWRnZV9Qb29sLnBvb2xbdWlkXS5xdWVyeS50bXApO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBCcmlkZ2VfUG9vbC5wb29sW3VpZF07XG4gICAgfTtcbiAgICBCcmlkZ2VfUG9vbC5nZW5lcmF0ZUZ1bGxVUkwgPSBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICByZXR1cm4gaW5mby5wcm90b2NvbCArIGluZm8uaG9zdCArICc6JyArIGluZm8ucG9ydDtcbiAgICB9O1xuICAgIEJyaWRnZV9Qb29sLm9yZGVyID0gW107XG4gICAgQnJpZGdlX1Bvb2wucG9vbCA9IHt9O1xuICAgIEJyaWRnZV9Qb29sLm1heENvbmN1cmVuY3kgPSAxMDtcbiAgICByZXR1cm4gQnJpZGdlX1Bvb2w7XG59KCkpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gQnJpZGdlX1Bvb2w7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9icmlkZ2VfUG9vbC50c1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZS11dWlkXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwibm9kZS11dWlkXCJcbi8vIG1vZHVsZSBpZCA9IDE1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0JztcbmV4cG9ydHMuTVNHID0ge1xuICAgIENIRUNLX1VSTDogJ0NIRUNLX1VSTCcsXG4gICAgR0VUX1VSTDogJ0dFVF9VUkwnLFxuICAgIEFOU1dFUjogJ1BBUkFNX0NMSUVOVF9BTlNXRVInLFxuICAgIFJFTkRFUl9TVEFUVVM6ICdFTlVNX0NBQ0hFX1NUQVRVUycsXG4gICAgSURMRTogJ0lETEUnLFxuICAgIExPRzogJ0xPRycsXG4gICAgRVJST1I6ICdFUlJPUicsXG59O1xuKGZ1bmN0aW9uIChFTlVNX1JFTkRFUl9TVEFUVVMpIHtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiU1RBUlRFRFwiXSA9IDBdID0gXCJTVEFSVEVEXCI7XG4gICAgRU5VTV9SRU5ERVJfU1RBVFVTW0VOVU1fUkVOREVSX1NUQVRVU1tcIlFVRVVFRFwiXSA9IDFdID0gXCJRVUVVRURcIjtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiSFRNTFwiXSA9IDJdID0gXCJIVE1MXCI7XG4gICAgRU5VTV9SRU5ERVJfU1RBVFVTW0VOVU1fUkVOREVSX1NUQVRVU1tcIkVSUk9SXCJdID0gM10gPSBcIkVSUk9SXCI7XG59KShleHBvcnRzLkVOVU1fUkVOREVSX1NUQVRVUyB8fCAoZXhwb3J0cy5FTlVNX1JFTkRFUl9TVEFUVVMgPSB7fSkpO1xudmFyIEVOVU1fUkVOREVSX1NUQVRVUyA9IGV4cG9ydHMuRU5VTV9SRU5ERVJfU1RBVFVTO1xuO1xuKGZ1bmN0aW9uIChFTlVNX0NBQ0hFX1NUQVRVUykge1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiUkVOREVSX0NBQ0hFXCJdID0gMF0gPSBcIlJFTkRFUl9DQUNIRVwiO1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiTk9fUkVOREVSXCJdID0gMV0gPSBcIk5PX1JFTkRFUlwiO1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiSFRNTFwiXSA9IDJdID0gXCJIVE1MXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJSRU5ERVJfTk9fQ0FDSEVcIl0gPSAzXSA9IFwiUkVOREVSX05PX0NBQ0hFXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJFUlJPUlwiXSA9IDRdID0gXCJFUlJPUlwiO1xufSkoZXhwb3J0cy5FTlVNX0NBQ0hFX1NUQVRVUyB8fCAoZXhwb3J0cy5FTlVNX0NBQ0hFX1NUQVRVUyA9IHt9KSk7XG52YXIgRU5VTV9DQUNIRV9TVEFUVVMgPSBleHBvcnRzLkVOVU1fQ0FDSEVfU1RBVFVTO1xuO1xuKGZ1bmN0aW9uIChFTlVNX1NMSU1FUl9FUlJPUlMpIHtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiRklMRV9BQ0NFU1NfRVJST1JcIl0gPSA1XSA9IFwiRklMRV9BQ0NFU1NfRVJST1JcIjtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiTkVUV09SS19FUlJPUlwiXSA9IDZdID0gXCJORVRXT1JLX0VSUk9SXCI7XG4gICAgRU5VTV9TTElNRVJfRVJST1JTW0VOVU1fU0xJTUVSX0VSUk9SU1tcIldFQkFQUF9FUlJPUlwiXSA9IDddID0gXCJXRUJBUFBfRVJST1JcIjtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiTE9HSUNfRVJST1JcIl0gPSA4XSA9IFwiTE9HSUNfRVJST1JcIjtcbn0pKGV4cG9ydHMuRU5VTV9TTElNRVJfRVJST1JTIHx8IChleHBvcnRzLkVOVU1fU0xJTUVSX0VSUk9SUyA9IHt9KSk7XG52YXIgRU5VTV9TTElNRVJfRVJST1JTID0gZXhwb3J0cy5FTlVNX1NMSU1FUl9FUlJPUlM7XG47XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9NRVNTQUdFUy50c1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xudmFyIHNwYXduZXJfMSA9IHJlcXVpcmUoJy4vc3Bhd25lcicpO1xudmFyIGJyaWRnZV9Qb29sXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9Qb29sJyk7XG52YXIgc2VydmVyTG9nXzEgPSByZXF1aXJlKCcuL3NlcnZlckxvZycpO1xudmFyIE1FU1NBR0VTXzEgPSByZXF1aXJlKCcuL01FU1NBR0VTJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCduZ1NlcnZlci1TbGltZXJQcm9jZXNzJyk7XG52YXIgU2xpbWVyUHJvY2VzcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2xpbWVyUHJvY2Vzcyh1aWQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy51aWQgPSB1aWQ7XG4gICAgICAgIHRoaXMua2lsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhciBsYXRlc3RTbGltZXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi8uLi9zbGltZXJqcy9zbGltZXJqcycpO1xuICAgICAgICB0aGlzLnNwYXduZXIgPSBuZXcgc3Bhd25lcl8xLmRlZmF1bHQodGhpcy51aWQsIGxhdGVzdFNsaW1lcik7XG4gICAgICAgIGRlYnVnKCdMQVVOQ0hJTkcgJywgcGF0aC5qb2luKF9fZGlybmFtZSwgJ0RERC5qcycpKTtcbiAgICAgICAgdGhpcy5zcGF3bmVyLnNldFBhcmFtZXRlcnMoW1xuICAgICAgICAgICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NsaW1lci1wYWdlLmpzJyksXG4gICAgICAgICAgICB0aGlzLnVpZCxcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3VpZF0ucXVlcnkudXJsLFxuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LmdlbmVyYXRlRnVsbFVSTChicmlkZ2VfUG9vbF8xLmRlZmF1bHQuc2VydmVyQ29uZmlnLnNvY2tldFNlcnZlcnMuYnJpZGdlX2ludGVybmFsKSxcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5nZW5lcmF0ZUZ1bGxVUkwoYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnNlcnZlckNvbmZpZy5zb2NrZXRTZXJ2ZXJzLnByb3h5KSxcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3VpZF0ucXVlcnkudG1wID8gYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdWlkXS5xdWVyeS50bXAgOiAnJ1xuICAgICAgICBdKTtcbiAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdGhpcy51aWRdLnBpZCA9IHRoaXMuc3Bhd25lci5sYXVuY2goZmFsc2UsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBkZWJ1ZyhkYXRhKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGNvZGUsIHNpZ25hbCkge1xuICAgICAgICAgICAgX3RoaXMub25Qcm9jZXNzRXhpdChjb2RlLCBzaWduYWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5raWxsKDE5NzcpO1xuICAgICAgICB9LCBicmlkZ2VfUG9vbF8xLmRlZmF1bHQuc2VydmVyQ29uZmlnLnRpbWVvdXQgKiAxMDAwKTtcbiAgICB9XG4gICAgU2xpbWVyUHJvY2Vzcy5wcm90b3R5cGUua2lsbCA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgIGRlYnVnKCdpbnZva2luZyBPblByb2Nlc3NFeGl0Jyk7XG4gICAgICAgIHZhciBwcm9jZXNzSW5mbyA9IGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3RoaXMudWlkXTtcbiAgICAgICAgdGhpcy5vblByb2Nlc3NFeGl0KGNvZGUsIG51bGwpO1xuICAgICAgICBkZWJ1ZygnaW52b2tpbmcgc3Bhd25lci5leGl0KCknKTtcbiAgICAgICAgc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoe1xuICAgICAgICAgICAgdWlkOiB0aGlzLnVpZCxcbiAgICAgICAgICAgIHNjcmlwdDogJ0JyaWRnZV9Qb29sJ1xuICAgICAgICB9KS5kZWJ1Zyh7IHBpZDogcHJvY2Vzc0luZm8ucGlkIH0sICdraWxsaW5nIHNwYXduZXInKTtcbiAgICAgICAgdGhpcy5zcGF3bmVyLmV4aXQoKTtcbiAgICB9O1xuICAgIFNsaW1lclByb2Nlc3MucHJvdG90eXBlLmdldFNwYXduZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNwYXduZXIuaW5mbygpO1xuICAgIH07XG4gICAgU2xpbWVyUHJvY2Vzcy5wcm90b3R5cGUub25Qcm9jZXNzRXhpdCA9IGZ1bmN0aW9uIChjb2RlLCBzaWduYWwpIHtcbiAgICAgICAgZGVidWcoJ29uUHJvY2Vzc0V4aXQgY2FsbGVkJywgY29kZSwgc2lnbmFsLCB0aGlzLnVpZCk7XG4gICAgICAgIGlmICh0aGlzLmtpbGxlZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5raWxsZWQgPSB0cnVlO1xuICAgICAgICB2YXIgbG9nZ2VyID0gc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoe1xuICAgICAgICAgICAgdWlkOiB0aGlzLnVpZCxcbiAgICAgICAgICAgIHNjcmlwdDogJ3NsaW1lclByb2Nlc3MnLFxuICAgICAgICAgICAgY29kZTogY29kZSxcbiAgICAgICAgICAgIHNpZ25hbDogc2lnbmFsXG4gICAgICAgIH0pO1xuICAgICAgICBsb2dnZXIuZGVidWcoJ29uUHJvY2Vzc0V4aXQgY2FsbGVkJyk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICBicmlkZ2VfUG9vbF8xLmRlZmF1bHQucG9vbFt0aGlzLnVpZF0uYmVuY2htYXJrLmNsb3NlZCA9IERhdGUubm93KCk7XG4gICAgICAgIGlmIChjb2RlID09PSAxOTc3KSB7XG4gICAgICAgICAgICBkZWJ1ZygnY29kZSAxOTc3ICh0aW1lb3V0KSBjYXVnaHQnKTtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignQ29kZSAxOTc3IHRpbWVvdXQgY2F1Z2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignU3Bhd25lciBleGl0ZWQgd2l0aCBhbiBlcnJvcicpO1xuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdGhpcy51aWRdLnN0YXR1cyA9IE1FU1NBR0VTXzEuRU5VTV9SRU5ERVJfU1RBVFVTLkVSUk9SO1xuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0Lm5vdGlmeUJyaWRnZUludGVybmFsKHRoaXMudWlkKTtcbiAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5kZWxldGVVSUQodGhpcy51aWQpO1xuICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0Lm5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnKCdFeGlzdGluZyBzbGltZXJQcm9jZXNzIHdpdGggZGF0YScsIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3RoaXMudWlkXSk7XG4gICAgICAgICAgICBpZiAoYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdGhpcy51aWRdLnN0YXR1cyA9PT0gTUVTU0FHRVNfMS5FTlVNX1JFTkRFUl9TVEFUVVMuSFRNTCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdUaGVyZSBpcyBIVE1MLCBsZXRzIG5leHQoKScpO1xuICAgICAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5kZWxldGVVSUQodGhpcy51aWQpO1xuICAgICAgICAgICAgICAgIGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZygndGhlcmUgaXMgbm8gaHRtbCwgbGV0cyB3YWl0Jyk7XG4gICAgICAgICAgICAgICAgYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbdGhpcy51aWRdLmV4aXQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gU2xpbWVyUHJvY2Vzcztcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTbGltZXJQcm9jZXNzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc2xpbWVyUHJvY2Vzcy50c1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbnZhciBzZXJ2ZXJMb2dfMSA9IHJlcXVpcmUoJy4vc2VydmVyTG9nJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCduZ1NlcnZlci1zcGF3bmVyJyk7XG52YXIgU3Bhd25lciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3Bhd25lcihuYW1lLCBiaW5QYXRoLCB4dmZiKSB7XG4gICAgICAgIGlmICh4dmZiID09PSB2b2lkIDApIHsgeHZmYiA9IGZhbHNlOyB9XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuYmluUGF0aCA9IGJpblBhdGg7XG4gICAgICAgIHRoaXMueHZmYiA9IHh2ZmI7XG4gICAgICAgIHRoaXMucGFyYW1zID0gW107XG4gICAgICAgIGlmICh4dmZiKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmFtcy5wdXNoKHRoaXMuYmluUGF0aCk7XG4gICAgICAgICAgICB0aGlzLmJpblBhdGggPSAneHZmYi1ydW4nO1xuICAgICAgICB9XG4gICAgfVxuICAgIFNwYXduZXIucHJvdG90eXBlLmluZm8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXJhbXM6IHRoaXMucGFyYW1zLFxuICAgICAgICAgICAgYmluUGF0aDogdGhpcy5iaW5QYXRoLFxuICAgICAgICAgICAgeHZmYjogdGhpcy54dmZiLFxuICAgICAgICAgICAgcGlkOiB0aGlzLmNoaWxkLnBpZCxcbiAgICAgICAgICAgIGNvbm5lY3RlZDogdGhpcy5jaGlsZC5jb25uZWN0ZWRcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFNwYXduZXIucHJvdG90eXBlLnNldFBhcmFtZXRlcnMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgIHRoaXMucGFyYW1zLnB1c2guYXBwbHkodGhpcy5wYXJhbXMsIHBhcmFtcyk7XG4gICAgfTtcbiAgICBTcGF3bmVyLnByb3RvdHlwZS5sYXVuY2ggPSBmdW5jdGlvbiAocmVsYXVuY2hPbkVycm9yLCBvblN0ZEVyciwgb25DbG9zZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBkZWJ1ZygnR29pbmcgdG8gbGF1bmNoJywgdGhpcy5iaW5QYXRoLCB0aGlzLnBhcmFtcyk7XG4gICAgICAgIHZhciBsb2dnZXIgPSBzZXJ2ZXJMb2dfMS5kZWZhdWx0LkxvZy5jaGlsZCh7XG4gICAgICAgICAgICB1aWQ6IHRoaXMubmFtZSxcbiAgICAgICAgICAgIHNjcmlwdDogJ1NwYXduZXInLFxuICAgICAgICAgICAgYmluOiB0aGlzLmJpblBhdGgsXG4gICAgICAgICAgICBwYXJhbXM6IHRoaXMucGFyYW1zXG4gICAgICAgIH0pO1xuICAgICAgICBsb2dnZXIuZGVidWcoJ0xhdW5jaGluZyBuZXcgcHJvY2VzcycpO1xuICAgICAgICB0aGlzLmNoaWxkID0gY2hpbGRfcHJvY2Vzcy5zcGF3bih0aGlzLmJpblBhdGgsIHRoaXMucGFyYW1zLCB7IHN0ZGlvOiBbMCwgMSwgMl0gfSk7XG4gICAgICAgIHRoaXMuY2hpbGQub24oJ2Vycm9yJywgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgZGVidWcoX3RoaXMubmFtZSwgJ3RoaXMuY2hpbGQub25FcnJvciAnLCBlcnIpO1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKHsgZXJyOiBlcnIgfSwgJ3RoaXMuY2hpbGQub25FcnJvcicpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jaGlsZC5vbignY2xvc2UnLCBmdW5jdGlvbiAoY29kZSwgc2lnbmFsKSB7XG4gICAgICAgICAgICBkZWJ1ZyhfdGhpcy5uYW1lLCAndGhpcy5jaGlsZC5vbkNsb3NlJywgY29kZSwgc2lnbmFsKTtcbiAgICAgICAgICAgIGlmIChjb2RlICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbGF1bmNoT25FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1ZygncmVsYXVuY2hpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubGF1bmNoKHJlbGF1bmNoT25FcnJvciwgb25TdGRFcnIsIG9uQ2xvc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvbkNsb3NlKGNvZGUsIHNpZ25hbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uQ2xvc2UoY29kZSwgbnVsbCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZC5waWQ7XG4gICAgfTtcbiAgICBTcGF3bmVyLnByb3RvdHlwZS5leGl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBkZWJ1Zyh0aGlzLm5hbWUsICdleGl0KCkgaW52b2tlZCcpO1xuICAgICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmNoaWxkLmtpbGwoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gU3Bhd25lcjtcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTcGF3bmVyO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc3Bhd25lci50c1xuLy8gbW9kdWxlIGlkID0gMThcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImNoaWxkX3Byb2Nlc3NcIlxuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZnNcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJmc1wiXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInRtcFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInRtcFwiXG4vLyBtb2R1bGUgaWQgPSAyMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG52YXIgaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8nKTtcbnZhciBodHRwID0gcmVxdWlyZSgnaHR0cCcpO1xudmFyIGJyaWRnZV9Qb29sXzEgPSByZXF1aXJlKCcuL2JyaWRnZV9Qb29sJyk7XG52YXIgTUVTU0FHRVNfMSA9IHJlcXVpcmUoJy4vTUVTU0FHRVMnKTtcbnZhciBjYWNoZV8xID0gcmVxdWlyZShcIi4vY2FjaGVcIik7XG52YXIgc2VydmVyTG9nXzEgPSByZXF1aXJlKCcuL3NlcnZlckxvZycpO1xudmFyIHByZWJvb3QgPSByZXF1aXJlKCdwcmVib290Jyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCduZ1NlcnZlci1CcmlkZ2VfUzInKTtcbnZhciBCcmlkZ2VfUzIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJyaWRnZV9TMihwb3J0KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMucHJlYm9vdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmh0dHBTZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcihmdW5jdGlvbiAocmVxLCByZXMpIHtcbiAgICAgICAgICAgIGRlYnVnKCdyZXF1ZXN0aW5nICcsIHJlcS51cmwpO1xuICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWwnIH0pO1xuICAgICAgICAgICAgcmVzLmVuZCgnRm9yYmlkZGVuJyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNvY2tldFNlcnZlciA9IGlvLmxpc3Rlbih0aGlzLmh0dHBTZXJ2ZXIsIHtcbiAgICAgICAgICAgIGFsbG93UmVxdWVzdDogZnVuY3Rpb24gKGhhbmRzaGFrZSwgY2IpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZyhoYW5kc2hha2UuX3F1ZXJ5KTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRzaGFrZS5fcXVlcnkudG9rZW4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihudWxsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBicmlkZ2VfUG9vbF8xLmRlZmF1bHQucG9vbFtoYW5kc2hha2UuX3F1ZXJ5LnRva2VuXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYihudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaHR0cFNlcnZlci5saXN0ZW4ocG9ydCk7XG4gICAgICAgIHRoaXMuc29ja2V0U2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICAgICAgZGVidWcoJ2JyaWRnZV9pbnRlcm5hbCBuZXcgY29ubmVjdGlvbicpO1xuICAgICAgICAgICAgc29ja2V0Lm9uKE1FU1NBR0VTXzEuTVNHLkxPRywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkZWJ1ZygnZ29pbmcgdG8gbG9nIHR5cGUgLyBhcmdzICcsIGRhdGEudHlwZSwgZGF0YS5hcmdzKTtcbiAgICAgICAgICAgICAgICB2YXIgbG9nZ2VyID0gc2VydmVyTG9nXzEuZGVmYXVsdC5XZWJBcHBMb2cuY2hpbGQoeyB1aWQ6IGRhdGEudWlkLCBzY3JpcHQ6ICdFRUUnIH0pO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZGF0YS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Rldic6XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIudHJhY2UoZGF0YS5hcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdkZWJ1Zyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoZGF0YS5hcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdsb2cnOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdpbmZvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKGRhdGEuYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnd2Fybic6XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihkYXRhLmFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihkYXRhLmFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzb2NrZXQub24oTUVTU0FHRVNfMS5NU0cuRVJST1IsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JPYmplY3QgPSBKU09OLnBhcnNlKGVycik7XG4gICAgICAgICAgICAgICAgZGVidWcoJ0RERF9NU0dfRVJST1IgcmVjZWl2ZWQnLCBlcnJvck9iamVjdCk7XG4gICAgICAgICAgICAgICAgc2VydmVyTG9nXzEuZGVmYXVsdC5Mb2cuY2hpbGQoeyB1aWQ6IGVycm9yT2JqZWN0LnVpZCwgc2NyaXB0OiAnQnJpZGdlX1MyJyB9KS5lcnJvcihlcnJvck9iamVjdCk7XG4gICAgICAgICAgICAgICAgc29ja2V0LmVtaXQoTUVTU0FHRVNfMS5NU0cuRVJST1IgKyBlcnJvck9iamVjdC51aWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzb2NrZXQub24oTUVTU0FHRVNfMS5NU0cuSURMRSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ3JlY2VpdmVkIElETEUgZnJvbSBFRUUnLCByZXNwb25zZS51aWQsIHJlc3BvbnNlLnVybCwgcmVzcG9uc2UuaHRtbC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIGRlYnVnKCdyZXNwb25zZUNhY2hlID0gJywgcmVzcG9uc2UuZXhwb3J0ZWRDYWNoZSk7XG4gICAgICAgICAgICAgICAgdmFyIHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShyZXNwb25zZS5leHBvcnRlZENhY2hlKTtcbiAgICAgICAgICAgICAgICB2YXIgc2NyaXB0ID0gXCI8c2NyaXB0IHR5cGU9XFxcInRleHQvamF2YXNjcmlwdFxcXCI+d2luZG93Lm5nU2VydmVyQ2FjaGUgPSBcIiArIHNlcmlhbGl6ZWQgKyBcIjs8L3NjcmlwdD48L2hlYWQ+XCI7XG4gICAgICAgICAgICAgICAgdmFyIHN1cGVySFRNTCA9IHJlc3BvbnNlLmh0bWwucmVwbGFjZSgvPFxcL2hlYWQ+Lywgc2NyaXB0KTtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMucHJlYm9vdCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJlYm9vdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBSb290OiAnZG9jdW1lbnQuYm9keSdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlubGluZVByZWJvb3RDb2RlID0gJzxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiPicgKyBwcmVib290LmdldElubGluZUNvZGUocHJlYm9vdE9wdGlvbnMpICsgJzwvc2NyaXB0PjwvYm9keT4nO1xuICAgICAgICAgICAgICAgICAgICBzdXBlckhUTUwgPSBzdXBlckhUTUwucmVwbGFjZSgvPFxcL2JvZHk+LywgaW5saW5lUHJlYm9vdENvZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYnJpZGdlX1Bvb2xfMS5kZWZhdWx0LnBvb2xbcmVzcG9uc2UudWlkXS5xdWVyeS5zdHJhdGVneSA9PT0gTUVTU0FHRVNfMS5FTlVNX0NBQ0hFX1NUQVRVUy5SRU5ERVJfQ0FDSEUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1VybCA9IG5ldyBjYWNoZV8xLlVybENhY2hlKGJyaWRnZV9Qb29sXzEuZGVmYXVsdC5wb29sW3Jlc3BvbnNlLnVpZF0ucXVlcnkudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3VXJsLnNldChzdXBlckhUTUwsIHt9LCBmdW5jdGlvbiAoZXJyLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJMb2dfMS5kZWZhdWx0LkxvZy5jaGlsZCh7IHVpZDogcmVzcG9uc2UudWlkLCBzY3JpcHQ6ICdCcmlkZ2VfUzInIH0pLmVycm9yKHsgcmVzcG9uc2U6IHJlc3BvbnNlLCBlcnI6IGVyciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnQ2FjaGUgb24gQnJpZGdlX01TR18yLkNBQ0hFX0lUIHN0YXR1cyA9ICcsIHN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmlkZ2VfUG9vbF8xLmRlZmF1bHQuc2VuZEhUTUxfdG9fQ2xpZW50KHJlc3BvbnNlLnVpZCwgc3VwZXJIVE1MKTtcbiAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdChNRVNTQUdFU18xLk1TRy5JRExFICsgcmVzcG9uc2UudWlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdicmlkZ2VfaW50ZXJuYWwgIGRlY29ubmVjdGVkJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIEJyaWRnZV9TMi5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB0aGlzLnNvY2tldFNlcnZlci5jbG9zZSgpO1xuICAgICAgICB0aGlzLmh0dHBTZXJ2ZXIuY2xvc2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2IoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gQnJpZGdlX1MyO1xufSgpKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IEJyaWRnZV9TMjtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2JyaWRnZV9TMi50c1xuLy8gbW9kdWxlIGlkID0gMjJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaHR0cFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImh0dHBcIlxuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnO1xudmFyIE1FU1NBR0VTXzEgPSByZXF1aXJlKCcuL01FU1NBR0VTJyk7XG52YXIgcmVkaXNfdXJsX2NhY2hlXzEgPSByZXF1aXJlKCdyZWRpcy11cmwtY2FjaGUnKTtcbnZhciB2YWxpZGF0b3JzXzEgPSByZXF1aXJlKCcuL3ZhbGlkYXRvcnMnKTtcbnZhciBzZXJ2ZXJMb2dfMSA9IHJlcXVpcmUoJy4vc2VydmVyTG9nJyk7XG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbnZhciB5YW1sID0gcmVxdWlyZSgnanMteWFtbCcpO1xudmFyIGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ25nU2VydmVyLUNhY2hlJyk7XG52YXIgQ2FjaGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhY2hlKGNvbmZpZ0RpciwgY2IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIHNlcnZlckNvbmZpZ3BhdGggPSBwYXRoLmpvaW4oY29uZmlnRGlyLCAnc2VydmVyQ29uZmlnLnltbCcpO1xuICAgICAgICB0aGlzLnNlcnZlckNvbmZpZyA9IHlhbWwubG9hZChmcy5yZWFkRmlsZVN5bmMoc2VydmVyQ29uZmlncGF0aCwgJ3V0ZjgnKSk7XG4gICAgICAgIHZhciByZW5kZXJSdWxlc1BhdGggPSBwYXRoLmpvaW4oY29uZmlnRGlyLCAnc2VydmVyUmVuZGVyUnVsZXMueW1sJyk7XG4gICAgICAgIHRoaXMucmVuZGVyUnVsZXMgPSB2YWxpZGF0b3JzXzEuZGVmYXVsdC51bnNlcmlhbGl6ZVNlcnZlclJ1bGVzKHlhbWwubG9hZChmcy5yZWFkRmlsZVN5bmMocmVuZGVyUnVsZXNQYXRoLCAndXRmOCcpKSk7XG4gICAgICAgIHZhciBjYWNoZVJ1bGVzUGF0aCA9IHBhdGguam9pbihjb25maWdEaXIsICdzZXJ2ZXJDYWNoZVJ1bGVzLnltbCcpO1xuICAgICAgICB0aGlzLmNhY2hlUnVsZXMgPSByZWRpc191cmxfY2FjaGVfMS5DYWNoZUVuZ2luZUNCLmhlbHBlcnMudW5zZXJpYWxpemVDYWNoZVJ1bGVzKHlhbWwubG9hZChmcy5yZWFkRmlsZVN5bmMoY2FjaGVSdWxlc1BhdGgsICd1dGY4JykpKTtcbiAgICAgICAgcmVkaXNfdXJsX2NhY2hlXzEuQ2FjaGVDcmVhdG9yLmNyZWF0ZUNhY2hlKCdTRVJWRVInLCB0cnVlLCB0aGlzLnNlcnZlckNvbmZpZy5yZWRpc0NvbmZpZywgdGhpcy5jYWNoZVJ1bGVzLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ1NvbWUgZXJyb3I6ICcsIGVycik7XG4gICAgICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgX3RoaXMubG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFVybENhY2hlLmxvYWRDYWNoZUVuZ2luZShfdGhpcy5zZXJ2ZXJDb25maWcuZG9tYWluLCAnU0VSVkVSJywgX3RoaXMuc2VydmVyQ29uZmlnLnJlZGlzQ29uZmlnLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNiKG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBDYWNoZS5wcm90b3R5cGUuY2hlY2tVUkwgPSBmdW5jdGlvbiAodXJsLCBjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmxvZ2dlciA9IHNlcnZlckxvZ18xLmRlZmF1bHQuTG9nLmNoaWxkKHtcbiAgICAgICAgICAgIHNjcmlwdDogJ0NhY2hlJyxcbiAgICAgICAgICAgIHVybDogdXJsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMuc2hvdWxkUmVuZGVyKHVybCkpIHtcbiAgICAgICAgICAgIGNiKE1FU1NBR0VTXzEuTVNHLkFOU1dFUiwgeyBzdGF0dXM6IE1FU1NBR0VTXzEuRU5VTV9DQUNIRV9TVEFUVVMuTk9fUkVOREVSIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGJiYl91cmxfMSA9IG5ldyBVcmxDYWNoZSh1cmwpO1xuICAgICAgICAgICAgaWYgKGJiYl91cmxfMS5zaG91bGRDYWNoZSgpKSB7XG4gICAgICAgICAgICAgICAgZGVidWcoJ1Nob3VsZCBjYWNoZScpO1xuICAgICAgICAgICAgICAgIGJiYl91cmxfMS5oYXMoZnVuY3Rpb24gKGVyciwgaXNDYWNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubG9nZ2VyLmVycm9yKG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdFcnJvciBoYXBwZW5lZCwgJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYihNRVNTQUdFU18xLk1TRy5BTlNXRVIsIHsgc3RhdHVzOiBNRVNTQUdFU18xLkVOVU1fQ0FDSEVfU1RBVFVTLkVSUk9SLCBlcnI6IGVyciB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQ2FjaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1ZygnaXMgbm90IGNhY2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKE1FU1NBR0VTXzEuTVNHLkFOU1dFUiwgeyBzdGF0dXM6IE1FU1NBR0VTXzEuRU5VTV9DQUNIRV9TVEFUVVMuUkVOREVSX0NBQ0hFIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVidWcoJ2lzIGNhY2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmJiX3VybF8xLmdldChmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMubG9nZ2VyLmVycm9yKG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnKCdFcnJvciBoYXBwZW5lZCwgJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNiKE1FU1NBR0VTXzEuTVNHLkFOU1dFUiwgeyBzdGF0dXM6IE1FU1NBR0VTXzEuRU5VTV9DQUNIRV9TVEFUVVMuRVJST1IsIGVycjogZXJyIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYihNRVNTQUdFU18xLk1TRy5BTlNXRVIsIHsgc3RhdHVzOiBNRVNTQUdFU18xLkVOVU1fQ0FDSEVfU1RBVFVTLkhUTUwsIGh0bWw6IHJlc3VsdC5jb250ZW50IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlYnVnKCdzaG91bGQgbm90IGNhY2hlJyk7XG4gICAgICAgICAgICAgICAgY2IoTUVTU0FHRVNfMS5NU0cuQU5TV0VSLCB7IHN0YXR1czogTUVTU0FHRVNfMS5FTlVNX0NBQ0hFX1NUQVRVUy5SRU5ERVJfTk9fQ0FDSEUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIENhY2hlLnByb3RvdHlwZS5zaG91bGRSZW5kZXIgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHZhciBpLCByZWdleDtcbiAgICAgICAgZGVidWcoJ3Nob3VsZFJlbmRlciBjYWxsZWQgd2l0aCB1cmwsIHJlbmRlckNvbmZpZyAnLCB1cmwsIHRoaXMucmVuZGVyUnVsZXMpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMucmVuZGVyUnVsZXMuc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgIGNhc2UgJ25ldmVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjYXNlICdhbHdheXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY2FzZSAnaW5jbHVkZSc6XG4gICAgICAgICAgICAgICAgZm9yIChpIGluIHRoaXMucmVuZGVyUnVsZXMucnVsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVnZXggPSB0aGlzLnJlbmRlclJ1bGVzLnJ1bGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVnZXgudGVzdCh1cmwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjYXNlICdleGNsdWRlJzpcbiAgICAgICAgICAgICAgICBmb3IgKGkgaW4gdGhpcy5yZW5kZXJSdWxlcy5ydWxlcykge1xuICAgICAgICAgICAgICAgICAgICByZWdleCA9IHRoaXMucmVuZGVyUnVsZXMucnVsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KHVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIENhY2hlO1xufSgpKTtcbmV4cG9ydHMuQ2FjaGUgPSBDYWNoZTtcbnZhciBVcmxDYWNoZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVXJsQ2FjaGUodXJsKSB7XG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xuICAgICAgICB0aGlzLlVSTCA9IFVybENhY2hlLmNhY2hlRW5naW5lLnVybCh1cmwpO1xuICAgIH1cbiAgICBVcmxDYWNoZS5sb2FkQ2FjaGVFbmdpbmUgPSBmdW5jdGlvbiAoZGVmYXVsdERvbWFpbiwgaW5zdGFuY2VOYW1lLCByZWRpc0NvbmZpZywgY2IpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gbmV3IHJlZGlzX3VybF9jYWNoZV8xLkluc3RhbmNlKGluc3RhbmNlTmFtZSwgcmVkaXNDb25maWcsIHt9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgVXJsQ2FjaGUuY2FjaGVFbmdpbmUgPSBuZXcgcmVkaXNfdXJsX2NhY2hlXzEuQ2FjaGVFbmdpbmVDQihkZWZhdWx0RG9tYWluLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICBjYihudWxsKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBVcmxDYWNoZS5wcm90b3R5cGUuc2hvdWxkQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlVSTC5nZXRDYXRlZ29yeSgpID09PSAnbmV2ZXInID8gZmFsc2UgOiB0cnVlO1xuICAgIH07XG4gICAgVXJsQ2FjaGUucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB0aGlzLlVSTC5oYXMoY2IpO1xuICAgIH07XG4gICAgVXJsQ2FjaGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChjYikge1xuICAgICAgICB0aGlzLlVSTC5nZXQoY2IpO1xuICAgIH07XG4gICAgVXJsQ2FjaGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChjb250ZW50LCBleHRyYSwgY2IpIHtcbiAgICAgICAgdGhpcy5VUkwuc2V0KGNvbnRlbnQsIGV4dHJhLCBmYWxzZSwgY2IpO1xuICAgIH07XG4gICAgcmV0dXJuIFVybENhY2hlO1xufSgpKTtcbmV4cG9ydHMuVXJsQ2FjaGUgPSBVcmxDYWNoZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2NhY2hlLnRzXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciByZWRpc191cmxfY2FjaGVfMSA9IHJlcXVpcmUoJ3JlZGlzLXVybC1jYWNoZScpO1xudmFyIFZhbGlkYXRvcnMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFZhbGlkYXRvcnMoKSB7XG4gICAgfVxuICAgIFZhbGlkYXRvcnMudW5zZXJpYWxpemVTZXJ2ZXJSdWxlcyA9IGZ1bmN0aW9uIChydWxlcykge1xuICAgICAgICB2YXIgaW5kZXgsIHJlZ2V4O1xuICAgICAgICBmb3IgKGluZGV4IGluIHJ1bGVzLnJ1bGVzKSB7XG4gICAgICAgICAgICByZWdleCA9IHJlZGlzX3VybF9jYWNoZV8xLkNhY2hlRW5naW5lQ0IuaGVscGVycy51bnNlcmlhbGl6ZVJlZ2V4KHJ1bGVzLnJ1bGVzW2luZGV4XSk7XG4gICAgICAgICAgICBydWxlcy5ydWxlc1tpbmRleF0gPSByZWdleDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnVsZXM7XG4gICAgfTtcbiAgICByZXR1cm4gVmFsaWRhdG9ycztcbn0oKSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBWYWxpZGF0b3JzO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdmFsaWRhdG9ycy50c1xuLy8gbW9kdWxlIGlkID0gMjVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicHJlYm9vdFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInByZWJvb3RcIlxuLy8gbW9kdWxlIGlkID0gMjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==