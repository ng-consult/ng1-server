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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var page = __webpack_require__(27).create();
	page.settings.userAgent = 'SpecialAgent';
	var system = __webpack_require__(28);
	var fs = __webpack_require__(20);
	var slimerIO_1 = __webpack_require__(29);
	var MESSAGES_1 = __webpack_require__(16);
	var uid = system.args[1];
	var url = system.args[2];
	var bridge_internal_url = system.args[3];
	var PROXY_URL = system.args[4];
	var filePath = system.args[5];
	var slimerIO = new slimerIO_1.SlimerIO(bridge_internal_url);
	var renderType = typeof filePath !== 'undefined' && filePath.length > 0 ? 'file' : 'url';
	var html = null;
	if (renderType === 'file') {
	    if (!fs.isFile(filePath)) {
	        console.log('FILE_ACCESS_ERROR  - file doesnt exists' + filePath);
	        slimer.exit(MESSAGES_1.ENUM_SLIMER_ERRORS.FILE_ACCESS_ERROR);
	    }
	    if (!fs.isReadable(filePath)) {
	        console.log('FILE_ACCESS_ERROR - permission issue for ' + filePath);
	        slimer.exit(MESSAGES_1.ENUM_SLIMER_ERRORS.FILE_ACCESS_ERROR);
	    }
	    html = fs.read(filePath, {
	        mode: 'r',
	        charset: 'utf-8'
	    });
	}
	page.onLoadFinished = function (status) {
	};
	page.onConsoleMessage = function (msg, lineNum, sourceId) {
	    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
	};
	page.onLoadStarted = function () {
	};
	page.onResourceError = function (error) {
	    console.log('RESOURCE ERROR: ' + JSON.stringify(error));
	    slimerIO.createSocket('BI', bridge_internal_url, uid, function (socket) {
	        var errorObject = {
	            uid: uid,
	            message: error.errorString,
	            trace: [error.url]
	        };
	        socket.emit(MESSAGES_1.MSG.ERROR, JSON.stringify(errorObject));
	        socket.on(MESSAGES_1.MSG.ERROR + uid, function () {
	            socket.close();
	            console.log('closing with code ' + MESSAGES_1.ENUM_SLIMER_ERRORS.NETWORK_ERROR);
	            slimer.exit(MESSAGES_1.ENUM_SLIMER_ERRORS.NETWORK_ERROR);
	        });
	    });
	};
	page.onResourceTimeout = function (error) {
	    console.log('RESOURCE TIMEOUT: ' + JSON.stringify(error));
	    slimerIO.createSocket('BI', bridge_internal_url, uid, function (socket) {
	        var errorObject = {
	            uid: uid,
	            message: error.errorString,
	            trace: [error]
	        };
	        socket.emit(MESSAGES_1.MSG.ERROR, JSON.stringify(errorObject));
	        socket.on(MESSAGES_1.MSG.ERROR + uid, function () {
	            socket.close();
	            slimer.exit(MESSAGES_1.ENUM_SLIMER_ERRORS.NETWORK_ERROR);
	        });
	    });
	};
	page.onResourceRequested = function (requestData, networkRequest) {
	    if (requestData.method === 'GET' || requestData.method === 'OPTION') {
	        var requestedUrl = requestData.url;
	        if (requestedUrl.indexOf(PROXY_URL) === -1 && requestedUrl.indexOf(url) === -1 && requestedUrl.indexOf('/socket.io/') === -1) {
	            networkRequest.changeUrl(PROXY_URL + '/get?url=' + encodeURIComponent(requestedUrl));
	        }
	        else {
	        }
	    }
	};
	page.onInitialized = function () {
	    page.onCallback = function (data) {
	        switch (data.type) {
	            case 'idle':
	                slimer.exit(0);
	                break;
	            default:
	                throw 'onCallback(type) unknown type ' + data.type;
	        }
	    };
	    page.evaluate(function (uid, bridge_internal_url, PROXY_URL) {
			window['onServer'] = true;
	        window['serverConfig'] = window['serverConfig'] || {};

			window['ServerConfig'] = Object.assign({
	            uid: uid,
	            socketServerURL: bridge_internal_url,
	            clientTimeoutValue: 200,
	            restServerURL: PROXY_URL,
	            debug: false
	        }, window['serverConfig']);

	        window.addEventListener('Idle', function () {
	            window['callPhantom']({ type: 'idle' });
	        });

	    }, uid, bridge_internal_url, PROXY_URL);
	};
	var parseTrace = function (trace) {
	    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
	    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
	    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;
	    var extractLocation = function (urlLike) {
	        if (urlLike.indexOf(':') === -1) {
	            return [urlLike];
	        }
	        var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
	        var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
	        return [parts[1], parts[2] || undefined, parts[3] || undefined];
	    };
	    var exploded = trace.split('\n').filter(function (line) {
	        return !line.match(SAFARI_NATIVE_CODE_REGEXP);
	    });
	    return exploded.map(function (line) {
	        if (line.indexOf(' > eval') > -1) {
	            line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
	        }
	        var tokens = line.split('@');
	        var locationParts = extractLocation(tokens.pop());
	        var functionName = tokens.join('@') || undefined;
	        return {
	            function: functionName,
	            file: locationParts[0],
	            line: locationParts[1],
	            column: locationParts[2]
	        };
	    });
	};
	var onError = function (msg, trace) {
	    console.log(JSON.stringify(trace));
	    console.log(JSON.stringify(msg));
	    if (typeof trace === 'string') {
	        console.log('STRING TRACE = ', trace);
	        trace = parseTrace(trace);
	    }
	    var errorObject = {
	        message: msg,
	        uid: uid,
	        trace: []
	    };
	    if (trace && trace.length) {
	        console.log(JSON.stringify(trace));
	        trace.forEach(function (t) {
	            errorObject.trace.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : '' + '\n\n'));
	        });
	    }
	    console.log('ONERROR !!!! ONERROR !!! : ' + msg);
	    console.log('TRACE');
	    console.log(trace);
	    console.log(JSON.stringify(errorObject));
	    slimerIO.createSocket('BI', bridge_internal_url, uid, function (socket) {
	        socket.emit(MESSAGES_1.MSG.ERROR, JSON.stringify(errorObject));
	        socket.on(MESSAGES_1.MSG.ERROR + uid, function () {
	            socket.close();
	            console.log('closing with code ' + MESSAGES_1.ENUM_SLIMER_ERRORS.WEBAPP_ERROR);
	            slimer.exit(MESSAGES_1.ENUM_SLIMER_ERRORS.WEBAPP_ERROR);
	        });
	    });
	};
	page.onError = function (msg, trace) {
	    console.log('page.onError triggered');
	    onError(msg, trace);
	};
	if (renderType === 'url') {
	    try {
	        page.open(url, function (status) {
	            if (status !== 'success') {
	                console.log('Unable to access network');
	                slimer.exit(MESSAGES_1.ENUM_SLIMER_ERRORS.NETWORK_ERROR);
	            }
	        });
	    }
	    catch (e) {
	        onError("page.open(url): " + e.message, e.stack);
	    }
	}
	else {
	    try {
	        page.setContent(html, url);
	    }
	    catch (e) {
	        console.log('Error setting up content');
	        console.log(html);
	        onError("page.setContent(html, url): " + e.message, e.stack);
	    }
	}


/***/ },

/***/ 16:
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

/***/ 20:
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },

/***/ 27:
/***/ function(module, exports) {

	module.exports = require("webpage");

/***/ },

/***/ 28:
/***/ function(module, exports) {

	module.exports = require("system");

/***/ },

/***/ 29:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var webpage = __webpack_require__(27);
	var SlimerIO = (function () {
	    function SlimerIO(url) {
	        this.initialized = false;
	        this.pendingClients = [];
	        this.slimerSockets = {};
	        this.initializePage(url);
	    }
	    SlimerIO.prototype.createSocket = function (name, url, token, callback) {
	        if (this.initialized) {
	            this.slimerSockets[name] = new SlimerSocket(name, url, token, this.page);
	            callback(this.slimerSockets[name]);
	        }
	        else {
	            this.pendingClients.push({
	                name: name,
	                url: url,
	                token: token,
	                callback: callback
	            });
	        }
	    };
	    SlimerIO.prototype.initializePage = function (url) {
	        var _this = this;
	        this.page = webpage.create();
	        this.page.onConsoleMessage = function (msg, lineNum, sourceId) {
	            console.log('Slimer.IO CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
	        };
	        this.page.onLoadFinished = function (status) {
	            _this.initialized = true;
	            var newClient;
	            if (_this.pendingClients.length !== 0) {
	                while (newClient = _this.pendingClients.shift()) {
	                    _this.createSocket(newClient.name, newClient.url, newClient.token, newClient.callback);
	                }
	            }
	            _this.page.onCallback = function (data) {
	                _this.fireOnEvent(data);
	            };
	        };
	        var content = "<html><body>\n    <script type=\"text/javascript\" src=\"" + url + "/socket.io/socket.io.js\"></script>\n    </body></html>";
	        this.page.setContent(content, 'http://www.whatever.com');
	    };
	    SlimerIO.prototype.fireOnEvent = function (data) {
	        this.slimerSockets[data.name].fireOnEvent(data.event, data.data);
	    };
	    return SlimerIO;
	}());
	exports.SlimerIO = SlimerIO;
	var SlimerSocket = (function () {
	    function SlimerSocket(name, url, token, page) {
	        this.name = name;
	        this.page = page;
	        this.onListeners = {};
	        this.page.evaluate(function (name, url, token) {
	            if (typeof window['socket'] === 'undefined') {
	                window['socket'] = {};
	            }
	            var socket = window['io'](url + '?token=' + token);
	            socket.on('connect', function () {
	                console.log('Slimer.IO connected ! ' + url);
	            });
	            window['socket'][name] = socket;
	        }, name, url, token);
	    }
	    SlimerSocket.prototype.addOnListener = function (event, listener) {
	        if (!this.onListeners[event]) {
	            this.onListeners[event] = [];
	        }
	        this.onListeners[event].push(listener);
	    };
	    ;
	    SlimerSocket.prototype.fireOnEvent = function (event, data) {
	        if (!this.onListeners[event]) {
	            return;
	        }
	        this.onListeners[event].forEach(function (listener) {
	            listener(data);
	        });
	    };
	    SlimerSocket.prototype.on = function (event, callback) {
	        console.log('Slimer.IO received event ' + this.name);
	        this.addOnListener(event, callback);
	        this.page.evaluate(function (name, event) {
	            window['socket'][name].on(event, function (data) {
	                window['callPhantom']({
	                    name: name,
	                    event: event,
	                    data: data
	                });
	            });
	        }, this.name, event);
	    };
	    ;
	    SlimerSocket.prototype.emit = function (event, message) {
	        console.log('slimer.IO emitting ' + this.name + ' -> ' + event);
	        var success = this.page.evaluate(function (name, event, message) {
	            window['socket'][name].emit(event, message);
	            return true;
	        }, this.name, event, message);
	        if (success !== true) {
	            console.log('Failure while emitting the message.');
	            throw new Error('Failure while emitting the message.');
	        }
	    };
	    ;
	    SlimerSocket.prototype.close = function () {
	        var success = this.page.evaluate(function (name) {
	            console.log('slimer.IOclosing Socket');
	            window['socket'][name].close();
	            return true;
	        }, this.name);
	        if (success !== true) {
	            console.log('Failure while closing the socket.');
	            throw new Error('Failure while closing the socket.');
	        }
	    };
	    ;
	    return SlimerSocket;
	}());
	exports.SlimerSocket = SlimerSocket;


/***/ }

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDk2ZTFlYzU0MDliODQxODgwNjM/NjljNyIsIndlYnBhY2s6Ly8vLi9zcmMvc2xpbWVyUGFnZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvTUVTU0FHRVMudHM/ZDJkZiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmc1wiPzJlMDkiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwid2VicGFnZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInN5c3RlbVwiIiwid2VicGFjazovLy8uL3NyYy9zbGltZXJJTy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxvQ0FBbUMsZUFBZTtBQUNsRCxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUMsZ0VBQWdFO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDLDhEQUE4RDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUMsZ0VBQWdFO0FBQ2pFO0FBQ0E7Ozs7Ozs7O0FDbENBLGdDOzs7Ozs7O0FDQUEscUM7Ozs7Ozs7QUNBQSxvQzs7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakIsY0FBYTtBQUNiLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEIiwiZmlsZSI6InNsaW1lci1wYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNDk2ZTFlYzU0MDliODQxODgwNjMiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBwYWdlID0gcmVxdWlyZSgnd2VicGFnZScpLmNyZWF0ZSgpO1xucGFnZS5zZXR0aW5ncy51c2VyQWdlbnQgPSAnU3BlY2lhbEFnZW50JztcbnZhciBzeXN0ZW0gPSByZXF1aXJlKCdzeXN0ZW0nKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgc2xpbWVySU9fMSA9IHJlcXVpcmUoJy4vc2xpbWVySU8nKTtcbnZhciBNRVNTQUdFU18xID0gcmVxdWlyZSgnLi9NRVNTQUdFUycpO1xudmFyIHVpZCA9IHN5c3RlbS5hcmdzWzFdO1xudmFyIHVybCA9IHN5c3RlbS5hcmdzWzJdO1xudmFyIGJyaWRnZV9pbnRlcm5hbF91cmwgPSBzeXN0ZW0uYXJnc1szXTtcbnZhciBQUk9YWV9VUkwgPSBzeXN0ZW0uYXJnc1s0XTtcbnZhciBmaWxlUGF0aCA9IHN5c3RlbS5hcmdzWzVdO1xudmFyIHNsaW1lcklPID0gbmV3IHNsaW1lcklPXzEuU2xpbWVySU8oYnJpZGdlX2ludGVybmFsX3VybCk7XG52YXIgcmVuZGVyVHlwZSA9IHR5cGVvZiBmaWxlUGF0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgZmlsZVBhdGgubGVuZ3RoID4gMCA/ICdmaWxlJyA6ICd1cmwnO1xudmFyIGh0bWwgPSBudWxsO1xuaWYgKHJlbmRlclR5cGUgPT09ICdmaWxlJykge1xuICAgIGlmICghZnMuaXNGaWxlKGZpbGVQYXRoKSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRklMRV9BQ0NFU1NfRVJST1IgIC0gZmlsZSBkb2VzbnQgZXhpc3RzJyArIGZpbGVQYXRoKTtcbiAgICAgICAgc2xpbWVyLmV4aXQoTUVTU0FHRVNfMS5FTlVNX1NMSU1FUl9FUlJPUlMuRklMRV9BQ0NFU1NfRVJST1IpO1xuICAgIH1cbiAgICBpZiAoIWZzLmlzUmVhZGFibGUoZmlsZVBhdGgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdGSUxFX0FDQ0VTU19FUlJPUiAtIHBlcm1pc3Npb24gaXNzdWUgZm9yICcgKyBmaWxlUGF0aCk7XG4gICAgICAgIHNsaW1lci5leGl0KE1FU1NBR0VTXzEuRU5VTV9TTElNRVJfRVJST1JTLkZJTEVfQUNDRVNTX0VSUk9SKTtcbiAgICB9XG4gICAgaHRtbCA9IGZzLnJlYWQoZmlsZVBhdGgsIHtcbiAgICAgICAgbW9kZTogJ3InLFxuICAgICAgICBjaGFyc2V0OiAndXRmLTgnXG4gICAgfSk7XG59XG5wYWdlLm9uTG9hZEZpbmlzaGVkID0gZnVuY3Rpb24gKHN0YXR1cykge1xufTtcbnBhZ2Uub25Db25zb2xlTWVzc2FnZSA9IGZ1bmN0aW9uIChtc2csIGxpbmVOdW0sIHNvdXJjZUlkKSB7XG4gICAgY29uc29sZS5sb2coJ0NPTlNPTEU6ICcgKyBtc2cgKyAnIChmcm9tIGxpbmUgIycgKyBsaW5lTnVtICsgJyBpbiBcIicgKyBzb3VyY2VJZCArICdcIiknKTtcbn07XG5wYWdlLm9uTG9hZFN0YXJ0ZWQgPSBmdW5jdGlvbiAoKSB7XG59O1xucGFnZS5vblJlc291cmNlRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZygnUkVTT1VSQ0UgRVJST1I6ICcgKyBKU09OLnN0cmluZ2lmeShlcnJvcikpO1xuICAgIHNsaW1lcklPLmNyZWF0ZVNvY2tldCgnQkknLCBicmlkZ2VfaW50ZXJuYWxfdXJsLCB1aWQsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgdmFyIGVycm9yT2JqZWN0ID0ge1xuICAgICAgICAgICAgdWlkOiB1aWQsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5lcnJvclN0cmluZyxcbiAgICAgICAgICAgIHRyYWNlOiBbZXJyb3IudXJsXVxuICAgICAgICB9O1xuICAgICAgICBzb2NrZXQuZW1pdChNRVNTQUdFU18xLk1TRy5FUlJPUiwgSlNPTi5zdHJpbmdpZnkoZXJyb3JPYmplY3QpKTtcbiAgICAgICAgc29ja2V0Lm9uKE1FU1NBR0VTXzEuTVNHLkVSUk9SICsgdWlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zaW5nIHdpdGggY29kZSAnICsgTUVTU0FHRVNfMS5FTlVNX1NMSU1FUl9FUlJPUlMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgICBzbGltZXIuZXhpdChNRVNTQUdFU18xLkVOVU1fU0xJTUVSX0VSUk9SUy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xucGFnZS5vblJlc291cmNlVGltZW91dCA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIGNvbnNvbGUubG9nKCdSRVNPVVJDRSBUSU1FT1VUOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IpKTtcbiAgICBzbGltZXJJTy5jcmVhdGVTb2NrZXQoJ0JJJywgYnJpZGdlX2ludGVybmFsX3VybCwgdWlkLCBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHZhciBlcnJvck9iamVjdCA9IHtcbiAgICAgICAgICAgIHVpZDogdWlkLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3IuZXJyb3JTdHJpbmcsXG4gICAgICAgICAgICB0cmFjZTogW2Vycm9yXVxuICAgICAgICB9O1xuICAgICAgICBzb2NrZXQuZW1pdChNRVNTQUdFU18xLk1TRy5FUlJPUiwgSlNPTi5zdHJpbmdpZnkoZXJyb3JPYmplY3QpKTtcbiAgICAgICAgc29ja2V0Lm9uKE1FU1NBR0VTXzEuTVNHLkVSUk9SICsgdWlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgICAgIHNsaW1lci5leGl0KE1FU1NBR0VTXzEuRU5VTV9TTElNRVJfRVJST1JTLk5FVFdPUktfRVJST1IpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5wYWdlLm9uUmVzb3VyY2VSZXF1ZXN0ZWQgPSBmdW5jdGlvbiAocmVxdWVzdERhdGEsIG5ldHdvcmtSZXF1ZXN0KSB7XG4gICAgaWYgKHJlcXVlc3REYXRhLm1ldGhvZCA9PT0gJ0dFVCcgfHwgcmVxdWVzdERhdGEubWV0aG9kID09PSAnT1BUSU9OJykge1xuICAgICAgICB2YXIgcmVxdWVzdGVkVXJsID0gcmVxdWVzdERhdGEudXJsO1xuICAgICAgICBpZiAocmVxdWVzdGVkVXJsLmluZGV4T2YoUFJPWFlfVVJMKSA9PT0gLTEgJiYgcmVxdWVzdGVkVXJsLmluZGV4T2YodXJsKSA9PT0gLTEgJiYgcmVxdWVzdGVkVXJsLmluZGV4T2YoJy9zb2NrZXQuaW8vJykgPT09IC0xKSB7XG4gICAgICAgICAgICBuZXR3b3JrUmVxdWVzdC5jaGFuZ2VVcmwoUFJPWFlfVVJMICsgJy9nZXQ/dXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQocmVxdWVzdGVkVXJsKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgIH1cbiAgICB9XG59O1xucGFnZS5vbkluaXRpYWxpemVkID0gZnVuY3Rpb24gKCkge1xuICAgIHBhZ2Uub25DYWxsYmFjayA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHN3aXRjaCAoZGF0YS50eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdpZGxlJzpcbiAgICAgICAgICAgICAgICBzbGltZXIuZXhpdCgwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgJ29uQ2FsbGJhY2sodHlwZSkgdW5rbm93biB0eXBlICcgKyBkYXRhLnR5cGU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHBhZ2UuZXZhbHVhdGUoZnVuY3Rpb24gKHVpZCwgYnJpZGdlX2ludGVybmFsX3VybCwgUFJPWFlfVVJMKSB7XG4gICAgICAgIHdpbmRvd1snb25TZXJ2ZXInXSA9IHRydWU7XG4gICAgICAgIHdpbmRvd1snc2VydmVyQ29uZmlnJ10gPSB3aW5kb3dbJ3NlcnZlckNvbmZpZyddIHx8IHt9O1xuICAgICAgICB3aW5kb3dbJ3NlcnZlckNvbmZpZyddID0gT2JqZWN0LmFzc2lnbih3aW5kb3dbJ3NlcnZlckNvbmZpZyddLCB7XG4gICAgICAgICAgICB1aWQ6IHVpZCxcbiAgICAgICAgICAgIHNvY2tldFNlcnZlclVSTDogYnJpZGdlX2ludGVybmFsX3VybCxcbiAgICAgICAgICAgIGNsaWVudFRpbWVvdXRWYWx1ZTogMjAwLFxuICAgICAgICAgICAgcmVzdFNlcnZlclVSTDogUFJPWFlfVVJMLFxuICAgICAgICAgICAgZGVidWc6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignSWRsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvd1snY2FsbFBoYW50b20nXSh7IHR5cGU6ICdpZGxlJyB9KTtcbiAgICAgICAgfSk7XG4gICAgfSwgdWlkLCBicmlkZ2VfaW50ZXJuYWxfdXJsLCBQUk9YWV9VUkwpO1xufTtcbnZhciBwYXJzZVRyYWNlID0gZnVuY3Rpb24gKHRyYWNlKSB7XG4gICAgdmFyIEZJUkVGT1hfU0FGQVJJX1NUQUNLX1JFR0VYUCA9IC8oXnxAKVxcUytcXDpcXGQrLztcbiAgICB2YXIgQ0hST01FX0lFX1NUQUNLX1JFR0VYUCA9IC9eXFxzKmF0IC4qKFxcUytcXDpcXGQrfFxcKG5hdGl2ZVxcKSkvbTtcbiAgICB2YXIgU0FGQVJJX05BVElWRV9DT0RFX1JFR0VYUCA9IC9eKGV2YWxAKT8oXFxbbmF0aXZlIGNvZGVcXF0pPyQvO1xuICAgIHZhciBleHRyYWN0TG9jYXRpb24gPSBmdW5jdGlvbiAodXJsTGlrZSkge1xuICAgICAgICBpZiAodXJsTGlrZS5pbmRleE9mKCc6JykgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gW3VybExpa2VdO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZWdFeHAgPSAvKC4rPykoPzpcXDooXFxkKykpPyg/OlxcOihcXGQrKSk/JC87XG4gICAgICAgIHZhciBwYXJ0cyA9IHJlZ0V4cC5leGVjKHVybExpa2UucmVwbGFjZSgvW1xcKFxcKV0vZywgJycpKTtcbiAgICAgICAgcmV0dXJuIFtwYXJ0c1sxXSwgcGFydHNbMl0gfHwgdW5kZWZpbmVkLCBwYXJ0c1szXSB8fCB1bmRlZmluZWRdO1xuICAgIH07XG4gICAgdmFyIGV4cGxvZGVkID0gdHJhY2Uuc3BsaXQoJ1xcbicpLmZpbHRlcihmdW5jdGlvbiAobGluZSkge1xuICAgICAgICByZXR1cm4gIWxpbmUubWF0Y2goU0FGQVJJX05BVElWRV9DT0RFX1JFR0VYUCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGV4cGxvZGVkLm1hcChmdW5jdGlvbiAobGluZSkge1xuICAgICAgICBpZiAobGluZS5pbmRleE9mKCcgPiBldmFsJykgPiAtMSkge1xuICAgICAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgvIGxpbmUgKFxcZCspKD86ID4gZXZhbCBsaW5lIFxcZCspKiA+IGV2YWxcXDpcXGQrXFw6XFxkKy9nLCAnOiQxJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRva2VucyA9IGxpbmUuc3BsaXQoJ0AnKTtcbiAgICAgICAgdmFyIGxvY2F0aW9uUGFydHMgPSBleHRyYWN0TG9jYXRpb24odG9rZW5zLnBvcCgpKTtcbiAgICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IHRva2Vucy5qb2luKCdAJykgfHwgdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZnVuY3Rpb246IGZ1bmN0aW9uTmFtZSxcbiAgICAgICAgICAgIGZpbGU6IGxvY2F0aW9uUGFydHNbMF0sXG4gICAgICAgICAgICBsaW5lOiBsb2NhdGlvblBhcnRzWzFdLFxuICAgICAgICAgICAgY29sdW1uOiBsb2NhdGlvblBhcnRzWzJdXG4gICAgICAgIH07XG4gICAgfSk7XG59O1xudmFyIG9uRXJyb3IgPSBmdW5jdGlvbiAobXNnLCB0cmFjZSkge1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRyYWNlKSk7XG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkobXNnKSk7XG4gICAgaWYgKHR5cGVvZiB0cmFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1NUUklORyBUUkFDRSA9ICcsIHRyYWNlKTtcbiAgICAgICAgdHJhY2UgPSBwYXJzZVRyYWNlKHRyYWNlKTtcbiAgICB9XG4gICAgdmFyIGVycm9yT2JqZWN0ID0ge1xuICAgICAgICBtZXNzYWdlOiBtc2csXG4gICAgICAgIHVpZDogdWlkLFxuICAgICAgICB0cmFjZTogW11cbiAgICB9O1xuICAgIGlmICh0cmFjZSAmJiB0cmFjZS5sZW5ndGgpIHtcbiAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodHJhY2UpKTtcbiAgICAgICAgdHJhY2UuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgZXJyb3JPYmplY3QudHJhY2UucHVzaCgnIC0+ICcgKyB0LmZpbGUgKyAnOiAnICsgdC5saW5lICsgKHQuZnVuY3Rpb24gPyAnIChpbiBmdW5jdGlvbiBcIicgKyB0LmZ1bmN0aW9uICsgJ1wiKScgOiAnJyArICdcXG5cXG4nKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnT05FUlJPUiAhISEhIE9ORVJST1IgISEhIDogJyArIG1zZyk7XG4gICAgY29uc29sZS5sb2coJ1RSQUNFJyk7XG4gICAgY29uc29sZS5sb2codHJhY2UpO1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGVycm9yT2JqZWN0KSk7XG4gICAgc2xpbWVySU8uY3JlYXRlU29ja2V0KCdCSScsIGJyaWRnZV9pbnRlcm5hbF91cmwsIHVpZCwgZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICBzb2NrZXQuZW1pdChNRVNTQUdFU18xLk1TRy5FUlJPUiwgSlNPTi5zdHJpbmdpZnkoZXJyb3JPYmplY3QpKTtcbiAgICAgICAgc29ja2V0Lm9uKE1FU1NBR0VTXzEuTVNHLkVSUk9SICsgdWlkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zaW5nIHdpdGggY29kZSAnICsgTUVTU0FHRVNfMS5FTlVNX1NMSU1FUl9FUlJPUlMuV0VCQVBQX0VSUk9SKTtcbiAgICAgICAgICAgIHNsaW1lci5leGl0KE1FU1NBR0VTXzEuRU5VTV9TTElNRVJfRVJST1JTLldFQkFQUF9FUlJPUik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbnBhZ2Uub25FcnJvciA9IGZ1bmN0aW9uIChtc2csIHRyYWNlKSB7XG4gICAgY29uc29sZS5sb2coJ3BhZ2Uub25FcnJvciB0cmlnZ2VyZWQnKTtcbiAgICBvbkVycm9yKG1zZywgdHJhY2UpO1xufTtcbmlmIChyZW5kZXJUeXBlID09PSAndXJsJykge1xuICAgIHRyeSB7XG4gICAgICAgIHBhZ2Uub3Blbih1cmwsIGZ1bmN0aW9uIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGlmIChzdGF0dXMgIT09ICdzdWNjZXNzJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdVbmFibGUgdG8gYWNjZXNzIG5ldHdvcmsnKTtcbiAgICAgICAgICAgICAgICBzbGltZXIuZXhpdChNRVNTQUdFU18xLkVOVU1fU0xJTUVSX0VSUk9SUy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIG9uRXJyb3IoXCJwYWdlLm9wZW4odXJsKTogXCIgKyBlLm1lc3NhZ2UsIGUuc3RhY2spO1xuICAgIH1cbn1cbmVsc2Uge1xuICAgIHRyeSB7XG4gICAgICAgIHBhZ2Uuc2V0Q29udGVudChodG1sLCB1cmwpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igc2V0dGluZyB1cCBjb250ZW50Jyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGh0bWwpO1xuICAgICAgICBvbkVycm9yKFwicGFnZS5zZXRDb250ZW50KGh0bWwsIHVybCk6IFwiICsgZS5tZXNzYWdlLCBlLnN0YWNrKTtcbiAgICB9XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zbGltZXJQYWdlLnRzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIid1c2Ugc3RyaWN0JztcbmV4cG9ydHMuTVNHID0ge1xuICAgIENIRUNLX1VSTDogJ0NIRUNLX1VSTCcsXG4gICAgR0VUX1VSTDogJ0dFVF9VUkwnLFxuICAgIEFOU1dFUjogJ1BBUkFNX0NMSUVOVF9BTlNXRVInLFxuICAgIFJFTkRFUl9TVEFUVVM6ICdFTlVNX0NBQ0hFX1NUQVRVUycsXG4gICAgSURMRTogJ0lETEUnLFxuICAgIExPRzogJ0xPRycsXG4gICAgRVJST1I6ICdFUlJPUicsXG59O1xuKGZ1bmN0aW9uIChFTlVNX1JFTkRFUl9TVEFUVVMpIHtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiU1RBUlRFRFwiXSA9IDBdID0gXCJTVEFSVEVEXCI7XG4gICAgRU5VTV9SRU5ERVJfU1RBVFVTW0VOVU1fUkVOREVSX1NUQVRVU1tcIlFVRVVFRFwiXSA9IDFdID0gXCJRVUVVRURcIjtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiSFRNTFwiXSA9IDJdID0gXCJIVE1MXCI7XG4gICAgRU5VTV9SRU5ERVJfU1RBVFVTW0VOVU1fUkVOREVSX1NUQVRVU1tcIkVSUk9SXCJdID0gM10gPSBcIkVSUk9SXCI7XG59KShleHBvcnRzLkVOVU1fUkVOREVSX1NUQVRVUyB8fCAoZXhwb3J0cy5FTlVNX1JFTkRFUl9TVEFUVVMgPSB7fSkpO1xudmFyIEVOVU1fUkVOREVSX1NUQVRVUyA9IGV4cG9ydHMuRU5VTV9SRU5ERVJfU1RBVFVTO1xuO1xuKGZ1bmN0aW9uIChFTlVNX0NBQ0hFX1NUQVRVUykge1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiUkVOREVSX0NBQ0hFXCJdID0gMF0gPSBcIlJFTkRFUl9DQUNIRVwiO1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiTk9fUkVOREVSXCJdID0gMV0gPSBcIk5PX1JFTkRFUlwiO1xuICAgIEVOVU1fQ0FDSEVfU1RBVFVTW0VOVU1fQ0FDSEVfU1RBVFVTW1wiSFRNTFwiXSA9IDJdID0gXCJIVE1MXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJSRU5ERVJfTk9fQ0FDSEVcIl0gPSAzXSA9IFwiUkVOREVSX05PX0NBQ0hFXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJFUlJPUlwiXSA9IDRdID0gXCJFUlJPUlwiO1xufSkoZXhwb3J0cy5FTlVNX0NBQ0hFX1NUQVRVUyB8fCAoZXhwb3J0cy5FTlVNX0NBQ0hFX1NUQVRVUyA9IHt9KSk7XG52YXIgRU5VTV9DQUNIRV9TVEFUVVMgPSBleHBvcnRzLkVOVU1fQ0FDSEVfU1RBVFVTO1xuO1xuKGZ1bmN0aW9uIChFTlVNX1NMSU1FUl9FUlJPUlMpIHtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiRklMRV9BQ0NFU1NfRVJST1JcIl0gPSA1XSA9IFwiRklMRV9BQ0NFU1NfRVJST1JcIjtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiTkVUV09SS19FUlJPUlwiXSA9IDZdID0gXCJORVRXT1JLX0VSUk9SXCI7XG4gICAgRU5VTV9TTElNRVJfRVJST1JTW0VOVU1fU0xJTUVSX0VSUk9SU1tcIldFQkFQUF9FUlJPUlwiXSA9IDddID0gXCJXRUJBUFBfRVJST1JcIjtcbiAgICBFTlVNX1NMSU1FUl9FUlJPUlNbRU5VTV9TTElNRVJfRVJST1JTW1wiTE9HSUNfRVJST1JcIl0gPSA4XSA9IFwiTE9HSUNfRVJST1JcIjtcbn0pKGV4cG9ydHMuRU5VTV9TTElNRVJfRVJST1JTIHx8IChleHBvcnRzLkVOVU1fU0xJTUVSX0VSUk9SUyA9IHt9KSk7XG52YXIgRU5VTV9TTElNRVJfRVJST1JTID0gZXhwb3J0cy5FTlVNX1NMSU1FUl9FUlJPUlM7XG47XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9NRVNTQUdFUy50c1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImZzXCJcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwid2VicGFnZVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcIndlYnBhZ2VcIlxuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwic3lzdGVtXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwic3lzdGVtXCJcbi8vIG1vZHVsZSBpZCA9IDI4XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIlwidXNlIHN0cmljdFwiO1xudmFyIHdlYnBhZ2UgPSByZXF1aXJlKCd3ZWJwYWdlJyk7XG52YXIgU2xpbWVySU8gPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNsaW1lcklPKHVybCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGVuZGluZ0NsaWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5zbGltZXJTb2NrZXRzID0ge307XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVBhZ2UodXJsKTtcbiAgICB9XG4gICAgU2xpbWVySU8ucHJvdG90eXBlLmNyZWF0ZVNvY2tldCA9IGZ1bmN0aW9uIChuYW1lLCB1cmwsIHRva2VuLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhpcy5zbGltZXJTb2NrZXRzW25hbWVdID0gbmV3IFNsaW1lclNvY2tldChuYW1lLCB1cmwsIHRva2VuLCB0aGlzLnBhZ2UpO1xuICAgICAgICAgICAgY2FsbGJhY2sodGhpcy5zbGltZXJTb2NrZXRzW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0NsaWVudHMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICB0b2tlbjogdG9rZW4sXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU2xpbWVySU8ucHJvdG90eXBlLmluaXRpYWxpemVQYWdlID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnBhZ2UgPSB3ZWJwYWdlLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLnBhZ2Uub25Db25zb2xlTWVzc2FnZSA9IGZ1bmN0aW9uIChtc2csIGxpbmVOdW0sIHNvdXJjZUlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU2xpbWVyLklPIENPTlNPTEU6ICcgKyBtc2cgKyAnIChmcm9tIGxpbmUgIycgKyBsaW5lTnVtICsgJyBpbiBcIicgKyBzb3VyY2VJZCArICdcIiknKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5wYWdlLm9uTG9hZEZpbmlzaGVkID0gZnVuY3Rpb24gKHN0YXR1cykge1xuICAgICAgICAgICAgX3RoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIG5ld0NsaWVudDtcbiAgICAgICAgICAgIGlmIChfdGhpcy5wZW5kaW5nQ2xpZW50cy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3Q2xpZW50ID0gX3RoaXMucGVuZGluZ0NsaWVudHMuc2hpZnQoKSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jcmVhdGVTb2NrZXQobmV3Q2xpZW50Lm5hbWUsIG5ld0NsaWVudC51cmwsIG5ld0NsaWVudC50b2tlbiwgbmV3Q2xpZW50LmNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5wYWdlLm9uQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmZpcmVPbkV2ZW50KGRhdGEpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSBcIjxodG1sPjxib2R5PlxcbiAgICA8c2NyaXB0IHR5cGU9XFxcInRleHQvamF2YXNjcmlwdFxcXCIgc3JjPVxcXCJcIiArIHVybCArIFwiL3NvY2tldC5pby9zb2NrZXQuaW8uanNcXFwiPjwvc2NyaXB0PlxcbiAgICA8L2JvZHk+PC9odG1sPlwiO1xuICAgICAgICB0aGlzLnBhZ2Uuc2V0Q29udGVudChjb250ZW50LCAnaHR0cDovL3d3dy53aGF0ZXZlci5jb20nKTtcbiAgICB9O1xuICAgIFNsaW1lcklPLnByb3RvdHlwZS5maXJlT25FdmVudCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHRoaXMuc2xpbWVyU29ja2V0c1tkYXRhLm5hbWVdLmZpcmVPbkV2ZW50KGRhdGEuZXZlbnQsIGRhdGEuZGF0YSk7XG4gICAgfTtcbiAgICByZXR1cm4gU2xpbWVySU87XG59KCkpO1xuZXhwb3J0cy5TbGltZXJJTyA9IFNsaW1lcklPO1xudmFyIFNsaW1lclNvY2tldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2xpbWVyU29ja2V0KG5hbWUsIHVybCwgdG9rZW4sIHBhZ2UpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5wYWdlID0gcGFnZTtcbiAgICAgICAgdGhpcy5vbkxpc3RlbmVycyA9IHt9O1xuICAgICAgICB0aGlzLnBhZ2UuZXZhbHVhdGUoZnVuY3Rpb24gKG5hbWUsIHVybCwgdG9rZW4pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93Wydzb2NrZXQnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3dbJ3NvY2tldCddID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc29ja2V0ID0gd2luZG93WydpbyddKHVybCArICc/dG9rZW49JyArIHRva2VuKTtcbiAgICAgICAgICAgIHNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU2xpbWVyLklPIGNvbm5lY3RlZCAhICcgKyB1cmwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3aW5kb3dbJ3NvY2tldCddW25hbWVdID0gc29ja2V0O1xuICAgICAgICB9LCBuYW1lLCB1cmwsIHRva2VuKTtcbiAgICB9XG4gICAgU2xpbWVyU29ja2V0LnByb3RvdHlwZS5hZGRPbkxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50LCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoIXRoaXMub25MaXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgICAgICAgICB0aGlzLm9uTGlzdGVuZXJzW2V2ZW50XSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25MaXN0ZW5lcnNbZXZlbnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIH07XG4gICAgO1xuICAgIFNsaW1lclNvY2tldC5wcm90b3R5cGUuZmlyZU9uRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uTGlzdGVuZXJzW2V2ZW50XSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25MaXN0ZW5lcnNbZXZlbnRdLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcihkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTbGltZXJTb2NrZXQucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICBjb25zb2xlLmxvZygnU2xpbWVyLklPIHJlY2VpdmVkIGV2ZW50ICcgKyB0aGlzLm5hbWUpO1xuICAgICAgICB0aGlzLmFkZE9uTGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5wYWdlLmV2YWx1YXRlKGZ1bmN0aW9uIChuYW1lLCBldmVudCkge1xuICAgICAgICAgICAgd2luZG93Wydzb2NrZXQnXVtuYW1lXS5vbihldmVudCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3dbJ2NhbGxQaGFudG9tJ10oe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBldmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzLm5hbWUsIGV2ZW50KTtcbiAgICB9O1xuICAgIDtcbiAgICBTbGltZXJTb2NrZXQucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZXZlbnQsIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3NsaW1lci5JTyBlbWl0dGluZyAnICsgdGhpcy5uYW1lICsgJyAtPiAnICsgZXZlbnQpO1xuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGFnZS5ldmFsdWF0ZShmdW5jdGlvbiAobmFtZSwgZXZlbnQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHdpbmRvd1snc29ja2V0J11bbmFtZV0uZW1pdChldmVudCwgbWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcy5uYW1lLCBldmVudCwgbWVzc2FnZSk7XG4gICAgICAgIGlmIChzdWNjZXNzICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbHVyZSB3aGlsZSBlbWl0dGluZyB0aGUgbWVzc2FnZS4nKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbHVyZSB3aGlsZSBlbWl0dGluZyB0aGUgbWVzc2FnZS4nKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgO1xuICAgIFNsaW1lclNvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdWNjZXNzID0gdGhpcy5wYWdlLmV2YWx1YXRlKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2xpbWVyLklPY2xvc2luZyBTb2NrZXQnKTtcbiAgICAgICAgICAgIHdpbmRvd1snc29ja2V0J11bbmFtZV0uY2xvc2UoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LCB0aGlzLm5hbWUpO1xuICAgICAgICBpZiAoc3VjY2VzcyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZhaWx1cmUgd2hpbGUgY2xvc2luZyB0aGUgc29ja2V0LicpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsdXJlIHdoaWxlIGNsb3NpbmcgdGhlIHNvY2tldC4nKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgO1xuICAgIHJldHVybiBTbGltZXJTb2NrZXQ7XG59KCkpO1xuZXhwb3J0cy5TbGltZXJTb2NrZXQgPSBTbGltZXJTb2NrZXQ7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9zbGltZXJJTy50c1xuLy8gbW9kdWxlIGlkID0gMjlcbi8vIG1vZHVsZSBjaHVua3MgPSAxIl0sInNvdXJjZVJvb3QiOiIifQ==