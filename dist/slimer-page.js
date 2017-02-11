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
	        window['serverConfig'] = Object.assign(window['serverConfig'], {
	            uid: uid,
	            socketServerURL: bridge_internal_url,
	            clientTimeoutValue: 200,
	            restServerURL: PROXY_URL,
	            debug: false
	        });
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
	var ENUM_RENDER_STATUS;
	(function (ENUM_RENDER_STATUS) {
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["STARTED"] = 0] = "STARTED";
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["QUEUED"] = 1] = "QUEUED";
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["HTML"] = 2] = "HTML";
	    ENUM_RENDER_STATUS[ENUM_RENDER_STATUS["ERROR"] = 3] = "ERROR";
	})(ENUM_RENDER_STATUS = exports.ENUM_RENDER_STATUS || (exports.ENUM_RENDER_STATUS = {}));
	;
	var ENUM_CACHE_STATUS;
	(function (ENUM_CACHE_STATUS) {
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["RENDER_CACHE"] = 0] = "RENDER_CACHE";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["NO_RENDER"] = 1] = "NO_RENDER";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["HTML"] = 2] = "HTML";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["RENDER_NO_CACHE"] = 3] = "RENDER_NO_CACHE";
	    ENUM_CACHE_STATUS[ENUM_CACHE_STATUS["ERROR"] = 4] = "ERROR";
	})(ENUM_CACHE_STATUS = exports.ENUM_CACHE_STATUS || (exports.ENUM_CACHE_STATUS = {}));
	;
	var ENUM_SLIMER_ERRORS;
	(function (ENUM_SLIMER_ERRORS) {
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["FILE_ACCESS_ERROR"] = 5] = "FILE_ACCESS_ERROR";
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["NETWORK_ERROR"] = 6] = "NETWORK_ERROR";
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["WEBAPP_ERROR"] = 7] = "WEBAPP_ERROR";
	    ENUM_SLIMER_ERRORS[ENUM_SLIMER_ERRORS["LOGIC_ERROR"] = 8] = "LOGIC_ERROR";
	})(ENUM_SLIMER_ERRORS = exports.ENUM_SLIMER_ERRORS || (exports.ENUM_SLIMER_ERRORS = {}));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZWI5MjhhZDJlMmVhOWFkYmU1NzQ/OGMxNCIsIndlYnBhY2s6Ly8vLi9zcmMvc2xpbWVyUGFnZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvTUVTU0FHRVMudHM/ZDJkZiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJmc1wiPzJlMDkiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwid2VicGFnZVwiIiwid2VicGFjazovLy9leHRlcm5hbCBcInN5c3RlbVwiIiwid2VicGFjazovLy8uL3NyYy9zbGltZXJJTy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxvQ0FBbUMsZUFBZTtBQUNsRCxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQyxxRkFBcUY7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUMsa0ZBQWtGO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQyxxRkFBcUY7QUFDdEY7Ozs7Ozs7O0FDbENBLGdDOzs7Ozs7O0FDQUEscUM7Ozs7Ozs7QUNBQSxvQzs7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakIsY0FBYTtBQUNiLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEIiwiZmlsZSI6InNsaW1lci1wYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgZWI5MjhhZDJlMmVhOWFkYmU1NzQiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBwYWdlID0gcmVxdWlyZSgnd2VicGFnZScpLmNyZWF0ZSgpO1xucGFnZS5zZXR0aW5ncy51c2VyQWdlbnQgPSAnU3BlY2lhbEFnZW50JztcbnZhciBzeXN0ZW0gPSByZXF1aXJlKCdzeXN0ZW0nKTtcbnZhciBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG52YXIgc2xpbWVySU9fMSA9IHJlcXVpcmUoXCIuL3NsaW1lcklPXCIpO1xudmFyIE1FU1NBR0VTXzEgPSByZXF1aXJlKFwiLi9NRVNTQUdFU1wiKTtcbnZhciB1aWQgPSBzeXN0ZW0uYXJnc1sxXTtcbnZhciB1cmwgPSBzeXN0ZW0uYXJnc1syXTtcbnZhciBicmlkZ2VfaW50ZXJuYWxfdXJsID0gc3lzdGVtLmFyZ3NbM107XG52YXIgUFJPWFlfVVJMID0gc3lzdGVtLmFyZ3NbNF07XG52YXIgZmlsZVBhdGggPSBzeXN0ZW0uYXJnc1s1XTtcbnZhciBzbGltZXJJTyA9IG5ldyBzbGltZXJJT18xLlNsaW1lcklPKGJyaWRnZV9pbnRlcm5hbF91cmwpO1xudmFyIHJlbmRlclR5cGUgPSB0eXBlb2YgZmlsZVBhdGggIT09ICd1bmRlZmluZWQnICYmIGZpbGVQYXRoLmxlbmd0aCA+IDAgPyAnZmlsZScgOiAndXJsJztcbnZhciBodG1sID0gbnVsbDtcbmlmIChyZW5kZXJUeXBlID09PSAnZmlsZScpIHtcbiAgICBpZiAoIWZzLmlzRmlsZShmaWxlUGF0aCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0ZJTEVfQUNDRVNTX0VSUk9SICAtIGZpbGUgZG9lc250IGV4aXN0cycgKyBmaWxlUGF0aCk7XG4gICAgICAgIHNsaW1lci5leGl0KE1FU1NBR0VTXzEuRU5VTV9TTElNRVJfRVJST1JTLkZJTEVfQUNDRVNTX0VSUk9SKTtcbiAgICB9XG4gICAgaWYgKCFmcy5pc1JlYWRhYmxlKGZpbGVQYXRoKSkge1xuICAgICAgICBjb25zb2xlLmxvZygnRklMRV9BQ0NFU1NfRVJST1IgLSBwZXJtaXNzaW9uIGlzc3VlIGZvciAnICsgZmlsZVBhdGgpO1xuICAgICAgICBzbGltZXIuZXhpdChNRVNTQUdFU18xLkVOVU1fU0xJTUVSX0VSUk9SUy5GSUxFX0FDQ0VTU19FUlJPUik7XG4gICAgfVxuICAgIGh0bWwgPSBmcy5yZWFkKGZpbGVQYXRoLCB7XG4gICAgICAgIG1vZGU6ICdyJyxcbiAgICAgICAgY2hhcnNldDogJ3V0Zi04J1xuICAgIH0pO1xufVxucGFnZS5vbkxvYWRGaW5pc2hlZCA9IGZ1bmN0aW9uIChzdGF0dXMpIHtcbn07XG5wYWdlLm9uQ29uc29sZU1lc3NhZ2UgPSBmdW5jdGlvbiAobXNnLCBsaW5lTnVtLCBzb3VyY2VJZCkge1xuICAgIGNvbnNvbGUubG9nKCdDT05TT0xFOiAnICsgbXNnICsgJyAoZnJvbSBsaW5lICMnICsgbGluZU51bSArICcgaW4gXCInICsgc291cmNlSWQgKyAnXCIpJyk7XG59O1xucGFnZS5vbkxvYWRTdGFydGVkID0gZnVuY3Rpb24gKCkge1xufTtcbnBhZ2Uub25SZXNvdXJjZUVycm9yID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgY29uc29sZS5sb2coJ1JFU09VUkNFIEVSUk9SOiAnICsgSlNPTi5zdHJpbmdpZnkoZXJyb3IpKTtcbiAgICBzbGltZXJJTy5jcmVhdGVTb2NrZXQoJ0JJJywgYnJpZGdlX2ludGVybmFsX3VybCwgdWlkLCBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHZhciBlcnJvck9iamVjdCA9IHtcbiAgICAgICAgICAgIHVpZDogdWlkLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3IuZXJyb3JTdHJpbmcsXG4gICAgICAgICAgICB0cmFjZTogW2Vycm9yLnVybF1cbiAgICAgICAgfTtcbiAgICAgICAgc29ja2V0LmVtaXQoTUVTU0FHRVNfMS5NU0cuRVJST1IsIEpTT04uc3RyaW5naWZ5KGVycm9yT2JqZWN0KSk7XG4gICAgICAgIHNvY2tldC5vbihNRVNTQUdFU18xLk1TRy5FUlJPUiArIHVpZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2luZyB3aXRoIGNvZGUgJyArIE1FU1NBR0VTXzEuRU5VTV9TTElNRVJfRVJST1JTLk5FVFdPUktfRVJST1IpO1xuICAgICAgICAgICAgc2xpbWVyLmV4aXQoTUVTU0FHRVNfMS5FTlVNX1NMSU1FUl9FUlJPUlMuTkVUV09SS19FUlJPUik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbnBhZ2Uub25SZXNvdXJjZVRpbWVvdXQgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmxvZygnUkVTT1VSQ0UgVElNRU9VVDogJyArIEpTT04uc3RyaW5naWZ5KGVycm9yKSk7XG4gICAgc2xpbWVySU8uY3JlYXRlU29ja2V0KCdCSScsIGJyaWRnZV9pbnRlcm5hbF91cmwsIHVpZCwgZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICB2YXIgZXJyb3JPYmplY3QgPSB7XG4gICAgICAgICAgICB1aWQ6IHVpZCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yLmVycm9yU3RyaW5nLFxuICAgICAgICAgICAgdHJhY2U6IFtlcnJvcl1cbiAgICAgICAgfTtcbiAgICAgICAgc29ja2V0LmVtaXQoTUVTU0FHRVNfMS5NU0cuRVJST1IsIEpTT04uc3RyaW5naWZ5KGVycm9yT2JqZWN0KSk7XG4gICAgICAgIHNvY2tldC5vbihNRVNTQUdFU18xLk1TRy5FUlJPUiArIHVpZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICAgICAgICBzbGltZXIuZXhpdChNRVNTQUdFU18xLkVOVU1fU0xJTUVSX0VSUk9SUy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xucGFnZS5vblJlc291cmNlUmVxdWVzdGVkID0gZnVuY3Rpb24gKHJlcXVlc3REYXRhLCBuZXR3b3JrUmVxdWVzdCkge1xuICAgIGlmIChyZXF1ZXN0RGF0YS5tZXRob2QgPT09ICdHRVQnIHx8IHJlcXVlc3REYXRhLm1ldGhvZCA9PT0gJ09QVElPTicpIHtcbiAgICAgICAgdmFyIHJlcXVlc3RlZFVybCA9IHJlcXVlc3REYXRhLnVybDtcbiAgICAgICAgaWYgKHJlcXVlc3RlZFVybC5pbmRleE9mKFBST1hZX1VSTCkgPT09IC0xICYmIHJlcXVlc3RlZFVybC5pbmRleE9mKHVybCkgPT09IC0xICYmIHJlcXVlc3RlZFVybC5pbmRleE9mKCcvc29ja2V0LmlvLycpID09PSAtMSkge1xuICAgICAgICAgICAgbmV0d29ya1JlcXVlc3QuY2hhbmdlVXJsKFBST1hZX1VSTCArICcvZ2V0P3VybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHJlcXVlc3RlZFVybCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICB9XG4gICAgfVxufTtcbnBhZ2Uub25Jbml0aWFsaXplZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBwYWdlLm9uQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnaWRsZSc6XG4gICAgICAgICAgICAgICAgc2xpbWVyLmV4aXQoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93ICdvbkNhbGxiYWNrKHR5cGUpIHVua25vd24gdHlwZSAnICsgZGF0YS50eXBlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBwYWdlLmV2YWx1YXRlKGZ1bmN0aW9uICh1aWQsIGJyaWRnZV9pbnRlcm5hbF91cmwsIFBST1hZX1VSTCkge1xuICAgICAgICB3aW5kb3dbJ29uU2VydmVyJ10gPSB0cnVlO1xuICAgICAgICB3aW5kb3dbJ3NlcnZlckNvbmZpZyddID0gd2luZG93WydzZXJ2ZXJDb25maWcnXSB8fCB7fTtcbiAgICAgICAgd2luZG93WydzZXJ2ZXJDb25maWcnXSA9IE9iamVjdC5hc3NpZ24od2luZG93WydzZXJ2ZXJDb25maWcnXSwge1xuICAgICAgICAgICAgdWlkOiB1aWQsXG4gICAgICAgICAgICBzb2NrZXRTZXJ2ZXJVUkw6IGJyaWRnZV9pbnRlcm5hbF91cmwsXG4gICAgICAgICAgICBjbGllbnRUaW1lb3V0VmFsdWU6IDIwMCxcbiAgICAgICAgICAgIHJlc3RTZXJ2ZXJVUkw6IFBST1hZX1VSTCxcbiAgICAgICAgICAgIGRlYnVnOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0lkbGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3dbJ2NhbGxQaGFudG9tJ10oeyB0eXBlOiAnaWRsZScgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sIHVpZCwgYnJpZGdlX2ludGVybmFsX3VybCwgUFJPWFlfVVJMKTtcbn07XG52YXIgcGFyc2VUcmFjZSA9IGZ1bmN0aW9uICh0cmFjZSkge1xuICAgIHZhciBGSVJFRk9YX1NBRkFSSV9TVEFDS19SRUdFWFAgPSAvKF58QClcXFMrXFw6XFxkKy87XG4gICAgdmFyIENIUk9NRV9JRV9TVEFDS19SRUdFWFAgPSAvXlxccyphdCAuKihcXFMrXFw6XFxkK3xcXChuYXRpdmVcXCkpL207XG4gICAgdmFyIFNBRkFSSV9OQVRJVkVfQ09ERV9SRUdFWFAgPSAvXihldmFsQCk/KFxcW25hdGl2ZSBjb2RlXFxdKT8kLztcbiAgICB2YXIgZXh0cmFjdExvY2F0aW9uID0gZnVuY3Rpb24gKHVybExpa2UpIHtcbiAgICAgICAgaWYgKHVybExpa2UuaW5kZXhPZignOicpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIFt1cmxMaWtlXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVnRXhwID0gLyguKz8pKD86XFw6KFxcZCspKT8oPzpcXDooXFxkKykpPyQvO1xuICAgICAgICB2YXIgcGFydHMgPSByZWdFeHAuZXhlYyh1cmxMaWtlLnJlcGxhY2UoL1tcXChcXCldL2csICcnKSk7XG4gICAgICAgIHJldHVybiBbcGFydHNbMV0sIHBhcnRzWzJdIHx8IHVuZGVmaW5lZCwgcGFydHNbM10gfHwgdW5kZWZpbmVkXTtcbiAgICB9O1xuICAgIHZhciBleHBsb2RlZCA9IHRyYWNlLnNwbGl0KCdcXG4nKS5maWx0ZXIoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgcmV0dXJuICFsaW5lLm1hdGNoKFNBRkFSSV9OQVRJVkVfQ09ERV9SRUdFWFApO1xuICAgIH0pO1xuICAgIHJldHVybiBleHBsb2RlZC5tYXAoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICAgICAgaWYgKGxpbmUuaW5kZXhPZignID4gZXZhbCcpID4gLTEpIHtcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoLyBsaW5lIChcXGQrKSg/OiA+IGV2YWwgbGluZSBcXGQrKSogPiBldmFsXFw6XFxkK1xcOlxcZCsvZywgJzokMScpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbnMgPSBsaW5lLnNwbGl0KCdAJyk7XG4gICAgICAgIHZhciBsb2NhdGlvblBhcnRzID0gZXh0cmFjdExvY2F0aW9uKHRva2Vucy5wb3AoKSk7XG4gICAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSB0b2tlbnMuam9pbignQCcpIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uOiBmdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICBmaWxlOiBsb2NhdGlvblBhcnRzWzBdLFxuICAgICAgICAgICAgbGluZTogbG9jYXRpb25QYXJ0c1sxXSxcbiAgICAgICAgICAgIGNvbHVtbjogbG9jYXRpb25QYXJ0c1syXVxuICAgICAgICB9O1xuICAgIH0pO1xufTtcbnZhciBvbkVycm9yID0gZnVuY3Rpb24gKG1zZywgdHJhY2UpIHtcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0cmFjZSkpO1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KG1zZykpO1xuICAgIGlmICh0eXBlb2YgdHJhY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTVFJJTkcgVFJBQ0UgPSAnLCB0cmFjZSk7XG4gICAgICAgIHRyYWNlID0gcGFyc2VUcmFjZSh0cmFjZSk7XG4gICAgfVxuICAgIHZhciBlcnJvck9iamVjdCA9IHtcbiAgICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgICB1aWQ6IHVpZCxcbiAgICAgICAgdHJhY2U6IFtdXG4gICAgfTtcbiAgICBpZiAodHJhY2UgJiYgdHJhY2UubGVuZ3RoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRyYWNlKSk7XG4gICAgICAgIHRyYWNlLmZvckVhY2goZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIGVycm9yT2JqZWN0LnRyYWNlLnB1c2goJyAtPiAnICsgdC5maWxlICsgJzogJyArIHQubGluZSArICh0LmZ1bmN0aW9uID8gJyAoaW4gZnVuY3Rpb24gXCInICsgdC5mdW5jdGlvbiArICdcIiknIDogJycgKyAnXFxuXFxuJykpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ09ORVJST1IgISEhISBPTkVSUk9SICEhISA6ICcgKyBtc2cpO1xuICAgIGNvbnNvbGUubG9nKCdUUkFDRScpO1xuICAgIGNvbnNvbGUubG9nKHRyYWNlKTtcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShlcnJvck9iamVjdCkpO1xuICAgIHNsaW1lcklPLmNyZWF0ZVNvY2tldCgnQkknLCBicmlkZ2VfaW50ZXJuYWxfdXJsLCB1aWQsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgc29ja2V0LmVtaXQoTUVTU0FHRVNfMS5NU0cuRVJST1IsIEpTT04uc3RyaW5naWZ5KGVycm9yT2JqZWN0KSk7XG4gICAgICAgIHNvY2tldC5vbihNRVNTQUdFU18xLk1TRy5FUlJPUiArIHVpZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2luZyB3aXRoIGNvZGUgJyArIE1FU1NBR0VTXzEuRU5VTV9TTElNRVJfRVJST1JTLldFQkFQUF9FUlJPUik7XG4gICAgICAgICAgICBzbGltZXIuZXhpdChNRVNTQUdFU18xLkVOVU1fU0xJTUVSX0VSUk9SUy5XRUJBUFBfRVJST1IpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5wYWdlLm9uRXJyb3IgPSBmdW5jdGlvbiAobXNnLCB0cmFjZSkge1xuICAgIGNvbnNvbGUubG9nKCdwYWdlLm9uRXJyb3IgdHJpZ2dlcmVkJyk7XG4gICAgb25FcnJvcihtc2csIHRyYWNlKTtcbn07XG5pZiAocmVuZGVyVHlwZSA9PT0gJ3VybCcpIHtcbiAgICB0cnkge1xuICAgICAgICBwYWdlLm9wZW4odXJsLCBmdW5jdGlvbiAoc3RhdHVzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdHVzICE9PSAnc3VjY2VzcycpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVW5hYmxlIHRvIGFjY2VzcyBuZXR3b3JrJyk7XG4gICAgICAgICAgICAgICAgc2xpbWVyLmV4aXQoTUVTU0FHRVNfMS5FTlVNX1NMSU1FUl9FUlJPUlMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICBvbkVycm9yKFwicGFnZS5vcGVuKHVybCk6IFwiICsgZS5tZXNzYWdlLCBlLnN0YWNrKTtcbiAgICB9XG59XG5lbHNlIHtcbiAgICB0cnkge1xuICAgICAgICBwYWdlLnNldENvbnRlbnQoaHRtbCwgdXJsKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHNldHRpbmcgdXAgY29udGVudCcpO1xuICAgICAgICBjb25zb2xlLmxvZyhodG1sKTtcbiAgICAgICAgb25FcnJvcihcInBhZ2Uuc2V0Q29udGVudChodG1sLCB1cmwpOiBcIiArIGUubWVzc2FnZSwgZS5zdGFjayk7XG4gICAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc2xpbWVyUGFnZS50c1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIndXNlIHN0cmljdCc7XG5leHBvcnRzLk1TRyA9IHtcbiAgICBDSEVDS19VUkw6ICdDSEVDS19VUkwnLFxuICAgIEdFVF9VUkw6ICdHRVRfVVJMJyxcbiAgICBBTlNXRVI6ICdQQVJBTV9DTElFTlRfQU5TV0VSJyxcbiAgICBSRU5ERVJfU1RBVFVTOiAnRU5VTV9DQUNIRV9TVEFUVVMnLFxuICAgIElETEU6ICdJRExFJyxcbiAgICBMT0c6ICdMT0cnLFxuICAgIEVSUk9SOiAnRVJST1InLFxufTtcbnZhciBFTlVNX1JFTkRFUl9TVEFUVVM7XG4oZnVuY3Rpb24gKEVOVU1fUkVOREVSX1NUQVRVUykge1xuICAgIEVOVU1fUkVOREVSX1NUQVRVU1tFTlVNX1JFTkRFUl9TVEFUVVNbXCJTVEFSVEVEXCJdID0gMF0gPSBcIlNUQVJURURcIjtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiUVVFVUVEXCJdID0gMV0gPSBcIlFVRVVFRFwiO1xuICAgIEVOVU1fUkVOREVSX1NUQVRVU1tFTlVNX1JFTkRFUl9TVEFUVVNbXCJIVE1MXCJdID0gMl0gPSBcIkhUTUxcIjtcbiAgICBFTlVNX1JFTkRFUl9TVEFUVVNbRU5VTV9SRU5ERVJfU1RBVFVTW1wiRVJST1JcIl0gPSAzXSA9IFwiRVJST1JcIjtcbn0pKEVOVU1fUkVOREVSX1NUQVRVUyA9IGV4cG9ydHMuRU5VTV9SRU5ERVJfU1RBVFVTIHx8IChleHBvcnRzLkVOVU1fUkVOREVSX1NUQVRVUyA9IHt9KSk7XG47XG52YXIgRU5VTV9DQUNIRV9TVEFUVVM7XG4oZnVuY3Rpb24gKEVOVU1fQ0FDSEVfU1RBVFVTKSB7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJSRU5ERVJfQ0FDSEVcIl0gPSAwXSA9IFwiUkVOREVSX0NBQ0hFXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJOT19SRU5ERVJcIl0gPSAxXSA9IFwiTk9fUkVOREVSXCI7XG4gICAgRU5VTV9DQUNIRV9TVEFUVVNbRU5VTV9DQUNIRV9TVEFUVVNbXCJIVE1MXCJdID0gMl0gPSBcIkhUTUxcIjtcbiAgICBFTlVNX0NBQ0hFX1NUQVRVU1tFTlVNX0NBQ0hFX1NUQVRVU1tcIlJFTkRFUl9OT19DQUNIRVwiXSA9IDNdID0gXCJSRU5ERVJfTk9fQ0FDSEVcIjtcbiAgICBFTlVNX0NBQ0hFX1NUQVRVU1tFTlVNX0NBQ0hFX1NUQVRVU1tcIkVSUk9SXCJdID0gNF0gPSBcIkVSUk9SXCI7XG59KShFTlVNX0NBQ0hFX1NUQVRVUyA9IGV4cG9ydHMuRU5VTV9DQUNIRV9TVEFUVVMgfHwgKGV4cG9ydHMuRU5VTV9DQUNIRV9TVEFUVVMgPSB7fSkpO1xuO1xudmFyIEVOVU1fU0xJTUVSX0VSUk9SUztcbihmdW5jdGlvbiAoRU5VTV9TTElNRVJfRVJST1JTKSB7XG4gICAgRU5VTV9TTElNRVJfRVJST1JTW0VOVU1fU0xJTUVSX0VSUk9SU1tcIkZJTEVfQUNDRVNTX0VSUk9SXCJdID0gNV0gPSBcIkZJTEVfQUNDRVNTX0VSUk9SXCI7XG4gICAgRU5VTV9TTElNRVJfRVJST1JTW0VOVU1fU0xJTUVSX0VSUk9SU1tcIk5FVFdPUktfRVJST1JcIl0gPSA2XSA9IFwiTkVUV09SS19FUlJPUlwiO1xuICAgIEVOVU1fU0xJTUVSX0VSUk9SU1tFTlVNX1NMSU1FUl9FUlJPUlNbXCJXRUJBUFBfRVJST1JcIl0gPSA3XSA9IFwiV0VCQVBQX0VSUk9SXCI7XG4gICAgRU5VTV9TTElNRVJfRVJST1JTW0VOVU1fU0xJTUVSX0VSUk9SU1tcIkxPR0lDX0VSUk9SXCJdID0gOF0gPSBcIkxPR0lDX0VSUk9SXCI7XG59KShFTlVNX1NMSU1FUl9FUlJPUlMgPSBleHBvcnRzLkVOVU1fU0xJTUVSX0VSUk9SUyB8fCAoZXhwb3J0cy5FTlVNX1NMSU1FUl9FUlJPUlMgPSB7fSkpO1xuO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvTUVTU0FHRVMudHNcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZnNcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJmc1wiXG4vLyBtb2R1bGUgaWQgPSAyMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndlYnBhZ2VcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJ3ZWJwYWdlXCJcbi8vIG1vZHVsZSBpZCA9IDI3XG4vLyBtb2R1bGUgY2h1bmtzID0gMSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInN5c3RlbVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInN5c3RlbVwiXG4vLyBtb2R1bGUgaWQgPSAyOFxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCJcInVzZSBzdHJpY3RcIjtcbnZhciB3ZWJwYWdlID0gcmVxdWlyZSgnd2VicGFnZScpO1xudmFyIFNsaW1lcklPID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTbGltZXJJTyh1cmwpIHtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBlbmRpbmdDbGllbnRzID0gW107XG4gICAgICAgIHRoaXMuc2xpbWVyU29ja2V0cyA9IHt9O1xuICAgICAgICB0aGlzLmluaXRpYWxpemVQYWdlKHVybCk7XG4gICAgfVxuICAgIFNsaW1lcklPLnByb3RvdHlwZS5jcmVhdGVTb2NrZXQgPSBmdW5jdGlvbiAobmFtZSwgdXJsLCB0b2tlbiwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2xpbWVyU29ja2V0c1tuYW1lXSA9IG5ldyBTbGltZXJTb2NrZXQobmFtZSwgdXJsLCB0b2tlbiwgdGhpcy5wYWdlKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMuc2xpbWVyU29ja2V0c1tuYW1lXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdDbGllbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFja1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNsaW1lcklPLnByb3RvdHlwZS5pbml0aWFsaXplUGFnZSA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5wYWdlID0gd2VicGFnZS5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy5wYWdlLm9uQ29uc29sZU1lc3NhZ2UgPSBmdW5jdGlvbiAobXNnLCBsaW5lTnVtLCBzb3VyY2VJZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NsaW1lci5JTyBDT05TT0xFOiAnICsgbXNnICsgJyAoZnJvbSBsaW5lICMnICsgbGluZU51bSArICcgaW4gXCInICsgc291cmNlSWQgKyAnXCIpJyk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucGFnZS5vbkxvYWRGaW5pc2hlZCA9IGZ1bmN0aW9uIChzdGF0dXMpIHtcbiAgICAgICAgICAgIF90aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBuZXdDbGllbnQ7XG4gICAgICAgICAgICBpZiAoX3RoaXMucGVuZGluZ0NsaWVudHMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5ld0NsaWVudCA9IF90aGlzLnBlbmRpbmdDbGllbnRzLnNoaWZ0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3JlYXRlU29ja2V0KG5ld0NsaWVudC5uYW1lLCBuZXdDbGllbnQudXJsLCBuZXdDbGllbnQudG9rZW4sIG5ld0NsaWVudC5jYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMucGFnZS5vbkNhbGxiYWNrID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5maXJlT25FdmVudChkYXRhKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHZhciBjb250ZW50ID0gXCI8aHRtbD48Ym9keT5cXG4gICAgPHNjcmlwdCB0eXBlPVxcXCJ0ZXh0L2phdmFzY3JpcHRcXFwiIHNyYz1cXFwiXCIgKyB1cmwgKyBcIi9zb2NrZXQuaW8vc29ja2V0LmlvLmpzXFxcIj48L3NjcmlwdD5cXG4gICAgPC9ib2R5PjwvaHRtbD5cIjtcbiAgICAgICAgdGhpcy5wYWdlLnNldENvbnRlbnQoY29udGVudCwgJ2h0dHA6Ly93d3cud2hhdGV2ZXIuY29tJyk7XG4gICAgfTtcbiAgICBTbGltZXJJTy5wcm90b3R5cGUuZmlyZU9uRXZlbnQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB0aGlzLnNsaW1lclNvY2tldHNbZGF0YS5uYW1lXS5maXJlT25FdmVudChkYXRhLmV2ZW50LCBkYXRhLmRhdGEpO1xuICAgIH07XG4gICAgcmV0dXJuIFNsaW1lcklPO1xufSgpKTtcbmV4cG9ydHMuU2xpbWVySU8gPSBTbGltZXJJTztcbnZhciBTbGltZXJTb2NrZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNsaW1lclNvY2tldChuYW1lLCB1cmwsIHRva2VuLCBwYWdlKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMucGFnZSA9IHBhZ2U7XG4gICAgICAgIHRoaXMub25MaXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgdGhpcy5wYWdlLmV2YWx1YXRlKGZ1bmN0aW9uIChuYW1lLCB1cmwsIHRva2VuKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvd1snc29ja2V0J10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgd2luZG93Wydzb2NrZXQnXSA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNvY2tldCA9IHdpbmRvd1snaW8nXSh1cmwgKyAnP3Rva2VuPScgKyB0b2tlbik7XG4gICAgICAgICAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NsaW1lci5JTyBjb25uZWN0ZWQgISAnICsgdXJsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgd2luZG93Wydzb2NrZXQnXVtuYW1lXSA9IHNvY2tldDtcbiAgICAgICAgfSwgbmFtZSwgdXJsLCB0b2tlbik7XG4gICAgfVxuICAgIFNsaW1lclNvY2tldC5wcm90b3R5cGUuYWRkT25MaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uTGlzdGVuZXJzW2V2ZW50XSkge1xuICAgICAgICAgICAgdGhpcy5vbkxpc3RlbmVyc1tldmVudF0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uTGlzdGVuZXJzW2V2ZW50XS5wdXNoKGxpc3RlbmVyKTtcbiAgICB9O1xuICAgIDtcbiAgICBTbGltZXJTb2NrZXQucHJvdG90eXBlLmZpcmVPbkV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIGlmICghdGhpcy5vbkxpc3RlbmVyc1tldmVudF0pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uTGlzdGVuZXJzW2V2ZW50XS5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgbGlzdGVuZXIoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgU2xpbWVyU29ja2V0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1NsaW1lci5JTyByZWNlaXZlZCBldmVudCAnICsgdGhpcy5uYW1lKTtcbiAgICAgICAgdGhpcy5hZGRPbkxpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgIHRoaXMucGFnZS5ldmFsdWF0ZShmdW5jdGlvbiAobmFtZSwgZXZlbnQpIHtcbiAgICAgICAgICAgIHdpbmRvd1snc29ja2V0J11bbmFtZV0ub24oZXZlbnQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgd2luZG93WydjYWxsUGhhbnRvbSddKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdGhpcy5uYW1lLCBldmVudCk7XG4gICAgfTtcbiAgICA7XG4gICAgU2xpbWVyU29ja2V0LnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKGV2ZW50LCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzbGltZXIuSU8gZW1pdHRpbmcgJyArIHRoaXMubmFtZSArICcgLT4gJyArIGV2ZW50KTtcbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLnBhZ2UuZXZhbHVhdGUoZnVuY3Rpb24gKG5hbWUsIGV2ZW50LCBtZXNzYWdlKSB7XG4gICAgICAgICAgICB3aW5kb3dbJ3NvY2tldCddW25hbWVdLmVtaXQoZXZlbnQsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sIHRoaXMubmFtZSwgZXZlbnQsIG1lc3NhZ2UpO1xuICAgICAgICBpZiAoc3VjY2VzcyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZhaWx1cmUgd2hpbGUgZW1pdHRpbmcgdGhlIG1lc3NhZ2UuJyk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWx1cmUgd2hpbGUgZW1pdHRpbmcgdGhlIG1lc3NhZ2UuJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIDtcbiAgICBTbGltZXJTb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMucGFnZS5ldmFsdWF0ZShmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3NsaW1lci5JT2Nsb3NpbmcgU29ja2V0Jyk7XG4gICAgICAgICAgICB3aW5kb3dbJ3NvY2tldCddW25hbWVdLmNsb3NlKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSwgdGhpcy5uYW1lKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MgIT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGYWlsdXJlIHdoaWxlIGNsb3NpbmcgdGhlIHNvY2tldC4nKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbHVyZSB3aGlsZSBjbG9zaW5nIHRoZSBzb2NrZXQuJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIDtcbiAgICByZXR1cm4gU2xpbWVyU29ja2V0O1xufSgpKTtcbmV4cG9ydHMuU2xpbWVyU29ja2V0ID0gU2xpbWVyU29ja2V0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc2xpbWVySU8udHNcbi8vIG1vZHVsZSBpZCA9IDI5XG4vLyBtb2R1bGUgY2h1bmtzID0gMSJdLCJzb3VyY2VSb290IjoiIn0=