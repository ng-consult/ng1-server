(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _Error = require('./controllers/Error');

var _Error2 = _interopRequireDefault(_Error);

var _Main = require('./controllers/Main');

var _Main2 = _interopRequireDefault(_Main);

var _Todo = require('./controllers/Todo');

var _Todo2 = _interopRequireDefault(_Todo);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _ProductList = require('./directives/ProductList');

var _ProductList2 = _interopRequireDefault(_ProductList);

var _ngCacheFactory = require('./provider/ngCacheFactory');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

// dream
//import { AngularClient } from './client';

var moduleName = 'myApp';

window[moduleName] = angular.module(moduleName, ['ngResource', 'ngRoute']).config(_routes2.default).controller('MainCtrl', _Main2.default).controller('TodoCtrl', _Todo2.default).controller('ErrorCtrl', _Error2.default).provider('$cacheFactory', _ngCacheFactory.$CacheFactoryProvider).provider('$templateCache', _ngCacheFactory.$TemplateCacheProvider).directive('productList', _ProductList2.default);

console.log('URL = ', window.location.href);

window[moduleName].config(function ($windowProvider, $httpProvider, $cacheFactoryProvider, $templateCacheProvider) {

    $httpProvider.defaults.cache = true;

    var $window = $windowProvider.$get();

    if ($window.onServer && $window.onServer === true) {
        $window.$cacheFactoryProvider = $cacheFactoryProvider;
    }

    if (typeof $window.onServer === 'undefined' && typeof $window.$angularServerCache !== 'undefined') {
        console.log('SHOULD LOAD CACHE !');

        $cacheFactoryProvider.importAll($window.$angularServerCache);

        $window.addEventListener('StackQueueEmpty', function () {
            console.log('clearing cache now');
            $cacheFactoryProvider.remove('$http');
            $httpProvider.defaults.cache = true;
        });
    }
});
/*

window[moduleName].config(function( $httpProvider, $CacheFactoryProvider, $TemplateCacheProvider, $ServerCacheProvider) {

    console.log('MyCacheProvider', $CacheFactoryProvider);
    console.log('$TemplateCacheProvider', $TemplateCacheProvider);
    console.log('$ServerCacheProvider', $ServerCacheProvider);

    var cacheFactory = $CacheFactoryProvider.$get;

    console.log('cacheFactory', cacheFactory);

    var serverCache = cacheFactory('server');

    console.log('serverCache = ', serverCache);

    $httpProvider.defaults.cache = serverCache;


    function interceptHttp( $q ) {
        return({
            request: request,
            requestError: requestError,
            response: response,
            responseError: responseError
        });

        function request( config ) {
            console.log('Stating request', config);
            if (!config.cache) {
                config.cache = serverCache;
            }
            return( config );
        }

        function requestError( rejection ) {
            return( $q.reject( rejection ) );
        }

        function response( response ) {
            console.log('getting response', response);

            if (typeof response.config.cache !== 'undefined') {
                var cache = response.config.cache;
                console.log(cache.info());
            } else {
                console.log('No cache object');
            }
            return( response );
        }

        function responseError( response ) {
            return( $q.reject( response ) );
        }
    }

    $httpProvider.interceptors.push( interceptHttp );

});
*/
/*
window[moduleName].config(function( $injector, $httpProvider, $cacheFactoryProvider) {


    var myInjector = angular.injector(['ng']);
    //console.log('myInjector = ', myInjector);

    var cacheFactory = $cacheFactoryProvider.$get;
    //console.log(cacheFactory);

    var serverCache = cacheFactory('server');

    var keys = {};

    var addKey = function(key) {

    };

    function interceptHttp( $q ) {
        return({
            request: request,
            requestError: requestError,
            response: response,
            responseError: responseError
        });

        function request( config ) {
            //console.log('Stating request', config);
            if (!config.cache) {
                config.cache = serverCache;
            }
            return( config );
        }

        function requestError( rejection ) {
            return( $q.reject( rejection ) );
        }

        function response( response ) {
            //console.log('getting response', response);

            if (typeof response.config.cache !== 'undefined') {
                var cache = response.config.cache;
                //console.log(cache.info());
            }
            return( response );
        }

        function responseError( response ) {
            return( $q.reject( response ) );
        }
    }

    $httpProvider.interceptors.push( interceptHttp );
});

*/
/** Dream

if ( typeof window.onServer === 'undefined') {
    AngularClient(angular, document, 100);
}
 */

},{"./controllers/Error":2,"./controllers/Main":3,"./controllers/Todo":4,"./directives/ProductList":5,"./provider/ngCacheFactory":6,"./routes":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by antoine on 17/02/16.
 */

var ErrorCtrl = function ErrorCtrl($log) {
    _classCallCheck(this, ErrorCtrl);

    this.throwError = function (text) {
        throw new Error(text);
    };

    this.throwException = function (text) {
        throw text;
    };

    var error1 = 'Catchable Error()';
    var error2 = 'Catchable Exception()';
    var error3 = 'Uncatchable Error() - should crash the app.';

    $log.log('Will....' + error1);

    try {
        this.throwError(error1);
    } catch (e1) {
        $log.log('I catched an Error/Exception: ' + e1);
        try {
            $log.log('Will....' + error2);
            this.throwException(error2);
        } catch (e2) {
            $log.log('I catched an Error/Exception: ' + e2);
            $log.log('Will....' + error3);
            this.throwException(error3);
        }
    }
};

exports.default = ErrorCtrl;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by antoine on 9/02/16.
 */

var MainCtrl = function MainCtrl($log) {
    _classCallCheck(this, MainCtrl);

    this.title = 'Angular Es6 revisited';


    $log.log('I am a log', 'with two parameters');
    $log.warn('I am a warn');
    $log.info('I am an info');
    /*$log.error('I am error with an object', {
        name: 'value'
    });*/
};

exports.default = MainCtrl;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by antoine on 9/02/16.
 */

var TodoCtrl = function TodoCtrl() {
    var _this = this;

    _classCallCheck(this, TodoCtrl);

    this.addTodo = function () {
        _this.todos.push({ text: _this.todoText, done: false });
        _this.todoText = '';
    };

    this.title = "Todos title";
    this.todos = [{ text: 'learn angular', done: true }, { text: 'build an angular app', done: false }];
    this.todoText = '';

    console.log('TodoCtrl Loaded', this);
};

exports.default = TodoCtrl;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function ($http) {
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        template: '<div><span ng-show="loading">loading products</span> <li ng-repeat="product in products">{{product.name}} {{product.price}}</li></div>',
        link: function link(scope, element, attrs) {
            scope.loading = true;
            $http.get('http://api.example:8080/products').success(function (data) {
                scope.products = data;
                scope.loading = false;
            });
        }
    };
};

;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.$CacheFactoryProvider = $CacheFactoryProvider;
exports.$TemplateCacheProvider = $TemplateCacheProvider;
exports.$ServerCacheProvider = $ServerCacheProvider;
function $CacheFactoryProvider() {

    var caches = {};

    this.getCaches = function () {
        return caches;
    };

    this.export = function (cacheId) {
        if (typeof cache[cacheId] === 'undefined') {
            throw new Error('$cacheFactory - iid - CacheId ' + cacheId + ' is not defined!');
        }
        return caches[cacheId].export();
    };

    this.exportAll = function () {
        var _caches = {};
        for (var i in caches) {
            _caches[i] = caches[i].export();
        }
        return _caches;
    };

    this.remove = function (cacheId) {
        if (typeof caches[cacheId] !== 'undefined') {
            delete caches[cacheId];
        }
    };

    this.removeAll = function () {
        caches = {};
    };

    this.importAll = function (cacheData) {

        var cacheFactory = this.$get();
        for (var i in cacheData) {
            if (typeof caches[i] === 'undefined') {
                caches[i] = cacheFactory(i);
            }
            caches[i].import(cacheData[i]);
        }
    };

    this.import = function (cacheId, cacheData) {

        var cacheFactory = this.$get();
        if (typeof caches[cacheId] === 'undefined') {
            caches[cacheId] = cacheFactory(i);
        }

        caches[cacheId].import(cacheData);
    };

    this.info = function (cacheId) {
        if (typeof caches[cacheId] === 'undefined') {
            throw new Error('$cacheFactory - iid - CacheId ' + cacheId + ' is not defined!');
        }
        return caches[cacheId].info();
    };

    this.infoAll = function () {
        var info = {};
        for (var cacheId in caches) {
            info[cacheId] = caches[cacheId].info();
        }
        return info;
    };

    this.$get = function () {

        function cacheFactory(cacheId, options) {
            if (cacheId in caches) {
                return caches[cacheId];
                throw new Error('$cacheFactory - iid - CacheId ' + cacheId + ' is already taken!');
            }

            var size = 0,
                stats = Object.assign({}, options, { id: cacheId }),
                data = Object.create(null),
                capacity = options && options.capacity || Number.MAX_VALUE,
                lruHash = Object.create(null),
                freshEnd = null,
                staleEnd = null;

            return caches[cacheId] = {

                put: function put(key, value) {
                    if (typeof value === 'undefined') return;
                    if (capacity < Number.MAX_VALUE) {
                        var lruEntry = lruHash[key] || (lruHash[key] = { key: key });
                        refresh(lruEntry);
                    }

                    if (!(key in data)) size++;
                    data[key] = value;

                    if (size > capacity) {
                        this.remove(staleEnd.key);
                    }

                    return value;
                },

                export: function _export() {
                    return data;
                },

                import: function _import(data) {
                    size = 0;
                    lruHash = Object.create(null);
                    freshEnd = null;
                    staleEnd = null;
                    for (var i in data) {
                        this.put(i, data[i]);
                    }
                },

                get: function get(key) {
                    if (capacity < Number.MAX_VALUE) {
                        var lruEntry = lruHash[key];

                        if (!lruEntry) return;

                        refresh(lruEntry);
                    }

                    return data[key];
                },

                remove: function remove(key) {
                    if (capacity < Number.MAX_VALUE) {
                        var lruEntry = lruHash[key];

                        if (!lruEntry) return;

                        if (lruEntry === freshEnd) freshEnd = lruEntry.p;
                        if (lruEntry === staleEnd) staleEnd = lruEntry.n;
                        link(lruEntry.n, lruEntry.p);

                        delete lruHash[key];
                    }

                    if (!(key in data)) return;

                    delete data[key];
                    size--;
                },

                removeAll: function removeAll() {
                    data = Object.create(null);
                    size = 0;
                    lruHash = Object.create(null);
                    freshEnd = staleEnd = null;
                },

                destroy: function destroy() {
                    data = null;
                    stats = null;
                    lruHash = null;
                    delete caches[cacheId];
                },

                info: function info() {
                    return Object.assign({}, stats, { size: size });
                },

                keys: function keys() {
                    return Object.getOwnPropertyNames(data);
                }
            };

            /**
             * makes the `entry` the freshEnd of the LRU linked list
             */
            function refresh(entry) {
                if (entry !== freshEnd) {
                    if (!staleEnd) {
                        staleEnd = entry;
                    } else if (staleEnd === entry) {
                        staleEnd = entry.n;
                    }

                    link(entry.n, entry.p);
                    link(entry, freshEnd);
                    freshEnd = entry;
                    freshEnd.n = null;
                }
            }

            /**
             * bidirectionally links two entries of the LRU linked list
             */
            function link(nextEntry, prevEntry) {
                if (nextEntry !== prevEntry) {
                    if (nextEntry) nextEntry.p = prevEntry; //p stands for previous, 'prev' didn't minify
                    if (prevEntry) prevEntry.n = nextEntry; //n stands for next, 'next' didn't minify
                }
            }
        }

        cacheFactory.info = function () {
            var info = {};
            for (var cacheId in caches) {
                info[cacheId] = caches[cacheId].info();
            }
            return info;
        };

        return cacheFactory;
    };
}

function $TemplateCacheProvider() {
    this.$get = ['$cacheFactory', function ($cacheFactory) {
        return $cacheFactory('templates');
    }];
}

function $ServerCacheProvider() {
    this.$get = ['$cacheFactory', function ($cacheFactory) {
        return $cacheFactory('server');
    }];
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function ($routeProvider, $locationProvider, $sceProvider) {

    $sceProvider.enabled(false);

    $routeProvider.when('/Main', {
        templateUrl: '/views/products.html',
        controller: _Main2.default,
        controllerAs: 'vm'
    });

    $routeProvider.when('/Todo', {
        templateUrl: '/views/todos.html',
        controller: _Todo2.default,
        controllerAs: 'vm'
    });

    $routeProvider.when('/Error', {
        templateUrl: '/views/error.html',
        controller: _Error2.default,
        controllerAs: 'vm'
    });

    $routeProvider.otherwise('/Main');

    $locationProvider.html5Mode(true);
};

var _Main = require('./controllers/Main');

var _Main2 = _interopRequireDefault(_Main);

var _Todo = require('./controllers/Todo');

var _Todo2 = _interopRequireDefault(_Todo);

var _Error = require('./controllers/Error');

var _Error2 = _interopRequireDefault(_Error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by antoine on 9/02/16.
 */
;

//import {InjectServer} from '../angular/server';

},{"./controllers/Error":2,"./controllers/Main":3,"./controllers/Todo":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXBwLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL01haW4uanMiLCJjbGllbnQvY29udHJvbGxlcnMvVG9kby5qcyIsImNsaWVudC9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwiY2xpZW50L3Byb3ZpZGVyL25nQ2FjaGVGYWN0b3J5LmpzIiwiY2xpZW50L3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUFPQSxJQUFJLGFBQUosQUFBZTs7QUFFZixPQUFBLEFBQU8sY0FBYyxRQUFBLEFBQ0ksT0FESixBQUNXLFlBQVksQ0FBQSxBQUFDLGNBRHhCLEFBQ3VCLEFBQWUsWUFEdEMsQUFFSSx5QkFGSixBQUdJLFdBSEosQUFHZSw0QkFIZixBQUlJLFdBSkosQUFJZSw0QkFKZixBQUtJLFdBTEosQUFLZSw4QkFMZixBQU1JLFNBTkosQUFNYSx3REFOYixBQU9JLFNBUEosQUFPYSwwREFQYixBQVFJLFVBUkosQUFRYyw2QkFSbkM7O0FBVUEsUUFBQSxBQUFRLElBQVIsQUFBWSxVQUFVLE9BQUEsQUFBTyxTQUE3QixBQUFzQzs7QUFFdEMsT0FBQSxBQUFPLFlBQVAsQUFBbUIsT0FBTyxVQUFBLEFBQVMsaUJBQVQsQUFBMEIsZUFBMUIsQUFBeUMsdUJBQXpDLEFBQWdFLHdCQUF3QixBQUU5Rzs7a0JBQUEsQUFBYyxTQUFkLEFBQXVCLFFBQXZCLEFBQStCLEFBRS9COztRQUFJLFVBQVUsZ0JBQWQsQUFBYyxBQUFnQixBQUU5Qjs7UUFBSSxRQUFBLEFBQVEsWUFBWSxRQUFBLEFBQVEsYUFBaEMsQUFBNkMsTUFBTSxBQUMvQztnQkFBQSxBQUFRLHdCQUFSLEFBQWdDLEFBQ25DLEFBRUQ7OztRQUFJLE9BQU8sUUFBUCxBQUFlLGFBQWYsQUFBNEIsZUFBZ0IsT0FBTyxRQUFQLEFBQWUsd0JBQS9ELEFBQXVGLGFBQWMsQUFDakc7Z0JBQUEsQUFBUSxJQUFSLEFBQVksQUFFWjs7OEJBQUEsQUFBc0IsVUFBVSxRQUFoQyxBQUF3QyxBQUV4Qzs7Z0JBQUEsQUFBUSxpQkFBUixBQUF5QixtQkFBbUIsWUFBVyxBQUNuRDtvQkFBQSxBQUFRLElBQVIsQUFBWSxBQUNaO2tDQUFBLEFBQXNCLE9BQXRCLEFBQTZCLEFBQzdCOzBCQUFBLEFBQWMsU0FBZCxBQUF1QixRQWxCbkMsQUFlUSxBQUdJLEFBQStCLEFBQ2xDLEFBQ0osQUFHSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDOUNvQixTLEdBRWpCLG1CQUFZLElBQVosRUFBa0I7QUFBQTs7QUFBQSxTQXdCbEIsVUF4QmtCLEdBd0JMLFVBQUMsSUFBRCxFQUFVO0FBQ25CLGNBQU0sSUFBSSxLQUFKLENBQVUsSUFBVixDQUFOO0FBQ0gsS0ExQmlCOztBQUFBLFNBNEJsQixjQTVCa0IsR0E0QkQsVUFBQyxJQUFELEVBQVU7QUFDdkIsY0FBTSxJQUFOO0FBQ0gsS0E5QmlCOztBQUVkLFFBQU0sU0FBUyxtQkFBZjtBQUNBLFFBQU0sU0FBUyx1QkFBZjtBQUNBLFFBQU0sU0FBUyw2Q0FBZjs7QUFFQSxTQUFLLEdBQUwsQ0FBUyxhQUFhLE1BQXRCOztBQUVBLFFBQUk7QUFDQSxhQUFLLFVBQUwsQ0FBZ0IsTUFBaEI7QUFDSCxLQUZELENBRUUsT0FBTyxFQUFQLEVBQVc7QUFDVCxhQUFLLEdBQUwsQ0FBUyxtQ0FBbUMsRUFBNUM7QUFDQSxZQUFJO0FBQ0EsaUJBQUssR0FBTCxDQUFTLGFBQWEsTUFBdEI7QUFDQSxpQkFBSyxjQUFMLENBQW9CLE1BQXBCO0FBQ0gsU0FIRCxDQUdFLE9BQU8sRUFBUCxFQUFXO0FBQ1QsaUJBQUssR0FBTCxDQUFTLG1DQUFtQyxFQUE1QztBQUNBLGlCQUFLLEdBQUwsQ0FBUyxhQUFhLE1BQXRCO0FBQ0EsaUJBQUssY0FBTCxDQUFvQixNQUFwQjtBQUVIO0FBQ0o7QUFDSixDOztrQkF4QmdCLFM7Ozs7Ozs7Ozs7Ozs7OztJQ0NmLFEsR0FDRixrQkFBWSxJQUFaLEVBQWlCO0FBQUE7O0FBQUEsU0FZakIsS0FaaUIsR0FZVCx1QkFaUzs7O0FBRWIsU0FBSyxHQUFMLENBQVMsWUFBVCxFQUF1QixxQkFBdkI7QUFDQSxTQUFLLElBQUwsQ0FBVSxhQUFWO0FBQ0EsU0FBSyxJQUFMLENBQVUsY0FBVjs7OztBQU1ILEM7O2tCQUlVLFE7Ozs7Ozs7Ozs7Ozs7OztJQ2ZNLFEsR0FFakIsb0JBQWE7QUFBQTs7QUFBQTs7QUFBQSxTQUliLE9BSmEsR0FJSCxZQUFNO0FBQ1osY0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixFQUFDLE1BQUssTUFBSyxRQUFYLEVBQXFCLE1BQUssS0FBMUIsRUFBaEI7QUFDQSxjQUFLLFFBQUwsR0FBZ0IsRUFBaEI7QUFDSCxLQVBZOztBQUFBLFNBVWIsS0FWYSxHQVVMLGFBVks7QUFBQSxTQVliLEtBWmEsR0FZTCxDQUNKLEVBQUMsTUFBSyxlQUFOLEVBQXVCLE1BQUssSUFBNUIsRUFESSxFQUVKLEVBQUMsTUFBSyxzQkFBTixFQUE4QixNQUFLLEtBQW5DLEVBRkksQ0FaSztBQUFBLFNBZ0JiLFFBaEJhLEdBZ0JGLEVBaEJFOztBQUNULFlBQVEsR0FBUixDQUFZLGlCQUFaLEVBQStCLElBQS9CO0FBQ0gsQzs7a0JBSmdCLFE7Ozs7Ozs7OztrQkNKTixVQUFTLEtBQVQsRUFBZ0I7QUFDM0IsV0FBTztBQUNILGtCQUFVLEdBRFA7QUFFSCxpQkFBUyxJQUZOO0FBR0gsb0JBQVksS0FIVDtBQUlILGtCQUFVLHdJQUpQO0FBS0gsY0FBTSxjQUFVLEtBQVYsRUFBaUIsT0FBakIsRUFBMEIsS0FBMUIsRUFBaUM7QUFDbkMsa0JBQU0sT0FBTixHQUFnQixJQUFoQjtBQUNBLGtCQUFNLEdBQU4sQ0FBVSxrQ0FBVixFQUE4QyxPQUE5QyxDQUFzRCxVQUFVLElBQVYsRUFBZ0I7QUFDbEUsc0JBQU0sUUFBTixHQUFpQixJQUFqQjtBQUNBLHNCQUFNLE9BQU4sR0FBZ0IsS0FBaEI7QUFDSCxhQUhEO0FBSUg7QUFYRSxLQUFQO0FBYUgsQzs7QUFBQTs7Ozs7Ozs7USxBQ2RlLHdCLEFBQUE7USxBQXlOQSx5QixBQUFBO1EsQUFNQSx1QixBQUFBO0FBL05ULFNBQUEsQUFBUyx3QkFBd0IsQUFFcEM7O1FBQUksU0FBSixBQUFhLEFBRWI7O1NBQUEsQUFBSyxZQUFZLFlBQVcsQUFDeEI7ZUFESixBQUNJLEFBQU8sQUFDVixBQUVEOzs7U0FBQSxBQUFLLFNBQVMsVUFBQSxBQUFTLFNBQVMsQUFDNUI7WUFBSSxPQUFPLE1BQVAsQUFBTyxBQUFNLGFBQWpCLEFBQThCLGFBQWEsQUFDdkM7a0JBQU0sSUFBQSxBQUFJLE1BQU0sbUNBQUEsQUFBaUMsVUFBakQsQUFBTSxBQUFtRCxBQUM1RCxBQUNEOztlQUFPLE9BQUEsQUFBTyxTQUpsQixBQUlJLEFBQU8sQUFBZ0IsQUFFMUIsQUFFRDs7O1NBQUEsQUFBSyxZQUFZLFlBQVcsQUFDeEI7WUFBSSxVQUFKLEFBQWMsQUFDZDthQUFJLElBQUosQUFBUSxLQUFSLEFBQWEsUUFBUSxBQUNqQjtvQkFBQSxBQUFRLEtBQUssT0FBQSxBQUFPLEdBQXBCLEFBQWEsQUFBVSxBQUMxQixBQUNEOztlQUxKLEFBS0ksQUFBTyxBQUNWLEFBRUQ7OztTQUFBLEFBQUssU0FBUyxVQUFBLEFBQVMsU0FBUyxBQUM1QjtZQUFJLE9BQU8sT0FBUCxBQUFPLEFBQU8sYUFBbEIsQUFBK0IsYUFBYSxBQUN4QzttQkFBTyxPQUZmLEFBRVEsQUFBTyxBQUFPLEFBQ2pCLEFBQ0osQUFHRDs7OztTQUFBLEFBQUssWUFBWSxZQUFXLEFBQ3hCO2lCQURKLEFBQ0ksQUFBUyxBQUNaLEFBRUQ7OztTQUFBLEFBQUssWUFBWSxVQUFBLEFBQVMsV0FBVyxBQUVqQzs7WUFBSSxlQUFlLEtBQW5CLEFBQW1CLEFBQUssQUFDeEI7YUFBSSxJQUFKLEFBQVEsS0FBUixBQUFhLFdBQVcsQUFDcEI7Z0JBQUcsT0FBTyxPQUFQLEFBQU8sQUFBTyxPQUFqQixBQUF3QixhQUFhLEFBQ2pDO3VCQUFBLEFBQU8sS0FBSyxhQUFaLEFBQVksQUFBYSxBQUM1QixBQUNEOzttQkFBQSxBQUFPLEdBQVAsQUFBVSxPQUFPLFVBUHpCLEFBT1EsQUFBaUIsQUFBVSxBQUM5QixBQUNKLEFBRUQ7Ozs7U0FBQSxBQUFLLFNBQVMsVUFBQSxBQUFTLFNBQVQsQUFBa0IsV0FBVyxBQUV2Qzs7WUFBSSxlQUFlLEtBQW5CLEFBQW1CLEFBQUssQUFDeEI7WUFBRyxPQUFPLE9BQVAsQUFBTyxBQUFPLGFBQWpCLEFBQThCLGFBQWEsQUFDdkM7bUJBQUEsQUFBTyxXQUFXLGFBQWxCLEFBQWtCLEFBQWEsQUFDbEMsQUFFRDs7O2VBQUEsQUFBTyxTQUFQLEFBQWdCLE9BUHBCLEFBT0ksQUFBdUIsQUFDMUIsQUFFRDs7O1NBQUEsQUFBSyxPQUFPLFVBQUEsQUFBUyxTQUFTLEFBQzFCO1lBQUcsT0FBTyxPQUFQLEFBQU8sQUFBTyxhQUFqQixBQUE4QixhQUFhLEFBQ3ZDO2tCQUFNLElBQUEsQUFBSSxNQUFNLG1DQUFBLEFBQWlDLFVBQWpELEFBQU0sQUFBbUQsQUFDNUQsQUFDRDs7ZUFBTyxPQUFBLEFBQU8sU0FKbEIsQUFJSSxBQUFPLEFBQWdCLEFBQzFCLEFBRUQ7OztTQUFBLEFBQUssVUFBVSxZQUFXLEFBQ3RCO1lBQUksT0FBSixBQUFXLEFBQ1g7YUFBSyxJQUFMLEFBQVMsV0FBVCxBQUFxQixRQUFRLEFBQ3pCO2lCQUFBLEFBQUssV0FBVyxPQUFBLEFBQU8sU0FBdkIsQUFBZ0IsQUFBZ0IsQUFDbkMsQUFDRDs7ZUFMSixBQUtJLEFBQU8sQUFDVixBQUVEOzs7U0FBQSxBQUFLLE9BQU8sWUFBVyxBQUduQjs7aUJBQUEsQUFBUyxhQUFULEFBQXNCLFNBQXRCLEFBQStCLFNBQVMsQUFDcEM7Z0JBQUksV0FBSixBQUFlLFFBQVEsQUFDbkI7dUJBQU8sT0FBUCxBQUFPLEFBQU8sQUFDZDtzQkFBTSxJQUFBLEFBQUksTUFBTSxtQ0FBQSxBQUFpQyxVQUFqRCxBQUFNLEFBQW1ELEFBQzVELEFBRUQ7OztnQkFBSSxPQUFKLEFBQVc7Z0JBQ1AsUUFBUSxPQUFBLEFBQU8sT0FBUCxBQUFjLElBQWQsQUFBa0IsU0FBUyxFQUFDLElBRHhDLEFBQ1ksQUFBMkIsQUFBSztnQkFDeEMsT0FBTyxPQUFBLEFBQU8sT0FGbEIsQUFFVyxBQUFjO2dCQUNyQixXQUFZLFdBQVcsUUFBWixBQUFvQixZQUFhLE9BSGhELEFBR3VEO2dCQUNuRCxVQUFVLE9BQUEsQUFBTyxPQUpyQixBQUljLEFBQWM7Z0JBQ3hCLFdBTEosQUFLZTtnQkFDWCxXQU5KLEFBTWUsQUFHZjs7bUJBQU8sT0FBQSxBQUFPOztxQkFFTCxhQUFBLEFBQVMsS0FBVCxBQUFjLE9BQU8sQUFDdEI7d0JBQUssT0FBQSxBQUFPLFVBQVosQUFBc0IsYUFBYSxBQUNuQzt3QkFBSSxXQUFXLE9BQWYsQUFBc0IsV0FBVyxBQUM3Qjs0QkFBSSxXQUFXLFFBQUEsQUFBUSxTQUFTLFFBQUEsQUFBUSxPQUFPLEVBQUMsS0FBaEQsQUFBZSxBQUFnQyxBQUFNLEFBQ3JEO2dDQUFBLEFBQVEsQUFDWCxBQUVEOzs7d0JBQUksRUFBRSxPQUFOLEFBQUksQUFBUyxPQUFPLEFBQ3BCO3lCQUFBLEFBQUssT0FBTCxBQUFZLEFBRVo7O3dCQUFJLE9BQUosQUFBVyxVQUFVLEFBQ2pCOzZCQUFBLEFBQUssT0FBTyxTQUFaLEFBQXFCLEFBQ3hCLEFBRUQ7OzsyQkFoQmlCLEFBZ0JqQixBQUFPLEFBQ1YsQUFFRDs7O3dCQUFRLG1CQUFXLEFBQ2Y7MkJBcEJpQixBQW9CakIsQUFBTyxBQUNWLEFBRUQ7Ozt3QkFBUSxpQkFBQSxBQUFTLE1BQU0sQUFDbkI7MkJBQUEsQUFBTyxBQUNQOzhCQUFVLE9BQUEsQUFBTyxPQUFqQixBQUFVLEFBQWMsQUFDeEI7K0JBQUEsQUFBVyxBQUNYOytCQUFBLEFBQVcsQUFDWDt5QkFBSSxJQUFKLEFBQVEsS0FBUixBQUFhLE1BQU0sQUFDZjs2QkFBQSxBQUFLLElBQUwsQUFBUyxHQUFHLEtBN0JDLEFBNkJiLEFBQVksQUFBSyxBQUNwQixBQUNKLEFBRUQ7Ozs7cUJBQUssYUFBQSxBQUFTLEtBQUssQUFDZjt3QkFBSSxXQUFXLE9BQWYsQUFBc0IsV0FBVyxBQUM3Qjs0QkFBSSxXQUFXLFFBQWYsQUFBZSxBQUFRLEFBRXZCOzs0QkFBSSxDQUFKLEFBQUssVUFBVSxBQUVmOztnQ0FBQSxBQUFRLEFBQ1gsQUFFRDs7OzJCQUFPLEtBMUNVLEFBMENqQixBQUFPLEFBQUssQUFDZixBQUVEOzs7d0JBQVEsZ0JBQUEsQUFBUyxLQUFLLEFBQ2xCO3dCQUFJLFdBQVcsT0FBZixBQUFzQixXQUFXLEFBQzdCOzRCQUFJLFdBQVcsUUFBZixBQUFlLEFBQVEsQUFFdkI7OzRCQUFJLENBQUosQUFBSyxVQUFVLEFBRWY7OzRCQUFJLGFBQUosQUFBaUIsVUFBVSxXQUFXLFNBQVgsQUFBb0IsQUFDL0M7NEJBQUksYUFBSixBQUFpQixVQUFVLFdBQVcsU0FBWCxBQUFvQixBQUMvQzs2QkFBSyxTQUFMLEFBQWMsR0FBRSxTQUFoQixBQUF5QixBQUV6Qjs7K0JBQU8sUUFBUCxBQUFPLEFBQVEsQUFDbEIsQUFFRDs7O3dCQUFJLEVBQUUsT0FBTixBQUFJLEFBQVMsT0FBTyxBQUVwQjs7MkJBQU8sS0E1RFUsQUE0RGpCLEFBQU8sQUFBSyxBQUNaLEFBQ0gsQUFFRDs7OzsyQkFBVyxxQkFBVyxBQUNsQjsyQkFBTyxPQUFBLEFBQU8sT0FBZCxBQUFPLEFBQWMsQUFDckI7MkJBQUEsQUFBTyxBQUNQOzhCQUFVLE9BQUEsQUFBTyxPQUFqQixBQUFVLEFBQWMsQUFDeEI7K0JBQVcsV0FwRU0sQUFvRWpCLEFBQXNCLEFBQ3pCLEFBRUQ7Ozt5QkFBUyxtQkFBVyxBQUNoQjsyQkFBQSxBQUFPLEFBQ1A7NEJBQUEsQUFBUSxBQUNSOzhCQUFBLEFBQVUsQUFDVjsyQkFBTyxPQTNFVSxBQTJFakIsQUFBTyxBQUFPLEFBQ2pCLEFBRUQ7OztzQkFBTSxnQkFBVyxBQUNiOzJCQUFPLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBZCxBQUFrQixPQUFPLEVBQUMsTUEvRWhCLEFBK0VqQixBQUFPLEFBQXlCLEFBQU8sQUFDMUMsQUFFRDs7O3NCQUFNLGdCQUFXLEFBQ2I7MkJBQU8sT0FBQSxBQUFPLG9CQW5GdEIsQUFBeUIsQUFFckIsQUFpRkksQUFBTyxBQUEyQixBQUNyQyxBQU1MOzs7Ozs7O3FCQUFBLEFBQVMsUUFBVCxBQUFpQixPQUFPLEFBQ3BCO29CQUFJLFVBQUosQUFBYyxVQUFVLEFBQ3BCO3dCQUFJLENBQUosQUFBSyxVQUFVLEFBQ1g7bUNBREosQUFDSSxBQUFXLEFBQ2Q7MkJBQU0sSUFBSSxhQUFKLEFBQWlCLE9BQU8sQUFDM0I7bUNBQVcsTUFBWCxBQUFpQixBQUNwQixBQUVEOzs7eUJBQUssTUFBTCxBQUFXLEdBQUcsTUFBZCxBQUFvQixBQUNwQjt5QkFBQSxBQUFLLE9BQUwsQUFBWSxBQUNaOytCQUFBLEFBQVcsQUFDWDs2QkFBQSxBQUFTLElBQVQsQUFBYSxBQUNoQixBQUNKLEFBS0Q7Ozs7Ozs7cUJBQUEsQUFBUyxLQUFULEFBQWMsV0FBZCxBQUF5QixXQUFXLEFBQ2hDO29CQUFJLGNBQUosQUFBa0IsV0FBVyxBQUN6Qjt3QkFBQSxBQUFJLFdBQVcsVUFBQSxBQUFVLEksQUFBVixBQUFjLEFBQzdCO3dCQUFBLEFBQUksV0FBVyxVQUFBLEFBQVUsSSxBQUFWLEFBQWMsQUFDaEMsQUFDSixBQUNKLEFBRUQ7Ozs7O3FCQUFBLEFBQWEsT0FBTyxZQUFXLEFBQzNCO2dCQUFJLE9BQUosQUFBVyxBQUNYO2lCQUFLLElBQUwsQUFBUyxXQUFULEFBQXFCLFFBQVEsQUFDekI7cUJBQUEsQUFBSyxXQUFXLE9BQUEsQUFBTyxTQUF2QixBQUFnQixBQUFnQixBQUNuQyxBQUNEOzttQkFMSixBQUtJLEFBQU8sQUFDVixBQUVEOzs7ZUE5SUosQUE4SUksQUFBTyxBQUNWLEFBQ0o7Ozs7QUFFTSxTQUFBLEFBQVMseUJBQXlCLEFBQ3JDO1NBQUEsQUFBSyxRQUFPLEFBQUMsaUJBQWlCLFVBQUEsQUFBUyxlQUFlLEFBQ2xEO2VBQU8sY0FEWCxBQUFZLEFBQ1IsQUFBTyxBQUFjLEFBQ3hCLEFBQ0o7Ozs7QUFFTSxTQUFBLEFBQVMsdUJBQXVCLEFBQ25DO1NBQUEsQUFBSyxRQUFPLEFBQUMsaUJBQWlCLFVBQUEsQUFBUyxlQUFlLEFBQ2xEO2VBQU8sY0FEWCxBQUFZLEFBQ1IsQUFBTyxBQUFjLEFBQ3hCLEFBQ0o7Ozs7Ozs7Ozs7O2tCQzFOYyxVQUFTLGNBQVQsRUFBeUIsaUJBQXpCLEVBQTRDLFlBQTVDLEVBQTBEOztBQUdyRSxpQkFBYSxPQUFiLENBQXFCLEtBQXJCOztBQUVBLG1CQUFlLElBQWYsQ0FBb0IsT0FBcEIsRUFBNkI7QUFDekIscUJBQWEsc0JBRFk7QUFFekIsa0NBRnlCO0FBR3pCLHNCQUFjO0FBSFcsS0FBN0I7O0FBTUEsbUJBQWUsSUFBZixDQUFvQixPQUFwQixFQUE2QjtBQUN6QixxQkFBYSxtQkFEWTtBQUV6QixrQ0FGeUI7QUFHekIsc0JBQWM7QUFIVyxLQUE3Qjs7QUFNQSxtQkFBZSxJQUFmLENBQW9CLFFBQXBCLEVBQThCO0FBQzFCLHFCQUFhLG1CQURhO0FBRTFCLG1DQUYwQjtBQUcxQixzQkFBYztBQUhZLEtBQTlCOztBQU1BLG1CQUFlLFNBQWYsQ0FBeUIsT0FBekI7O0FBRUEsc0JBQWtCLFNBQWxCLENBQTRCLElBQTVCO0FBRUgsQzs7QUFqQ0Q7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUErQkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEVycm9yQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL0Vycm9yJztcbmltcG9ydCBNYWluQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9NYWluJztcbmltcG9ydCBUb2RvQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9Ub2RvJztcbmltcG9ydCBSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IFByb2R1Y3RMaXN0IGZyb20gJy4vZGlyZWN0aXZlcy9Qcm9kdWN0TGlzdCc7XG5pbXBvcnQgeyRDYWNoZUZhY3RvcnlQcm92aWRlciwgJFRlbXBsYXRlQ2FjaGVQcm92aWRlcn0gZnJvbSAnLi9wcm92aWRlci9uZ0NhY2hlRmFjdG9yeSc7XG5cblxuLy8gZHJlYW1cbi8vaW1wb3J0IHsgQW5ndWxhckNsaWVudCB9IGZyb20gJy4vY2xpZW50JztcblxuXG52YXIgbW9kdWxlTmFtZT0nbXlBcHAnO1xuXG53aW5kb3dbbW9kdWxlTmFtZV0gPSBhbmd1bGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAubW9kdWxlKG1vZHVsZU5hbWUsIFsnbmdSZXNvdXJjZScsICduZ1JvdXRlJ10pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uZmlnKFJvdXRlcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdNYWluQ3RybCcsIE1haW5DdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ1RvZG9DdHJsJywgVG9kb0N0cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignRXJyb3JDdHJsJywgRXJyb3JDdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnByb3ZpZGVyKCckY2FjaGVGYWN0b3J5JywgJENhY2hlRmFjdG9yeVByb3ZpZGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnByb3ZpZGVyKCckdGVtcGxhdGVDYWNoZScsICRUZW1wbGF0ZUNhY2hlUHJvdmlkZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGlyZWN0aXZlKCdwcm9kdWN0TGlzdCcsIFByb2R1Y3RMaXN0KTtcblxuY29uc29sZS5sb2coJ1VSTCA9ICcsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxud2luZG93W21vZHVsZU5hbWVdLmNvbmZpZyhmdW5jdGlvbigkd2luZG93UHJvdmlkZXIsICRodHRwUHJvdmlkZXIsICRjYWNoZUZhY3RvcnlQcm92aWRlciwgJHRlbXBsYXRlQ2FjaGVQcm92aWRlcikge1xuXG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5jYWNoZSA9IHRydWU7XG5cbiAgICB2YXIgJHdpbmRvdyA9ICR3aW5kb3dQcm92aWRlci4kZ2V0KCk7XG5cbiAgICBpZiAoJHdpbmRvdy5vblNlcnZlciAmJiAkd2luZG93Lm9uU2VydmVyID09PSB0cnVlKSB7XG4gICAgICAgICR3aW5kb3cuJGNhY2hlRmFjdG9yeVByb3ZpZGVyID0gJGNhY2hlRmFjdG9yeVByb3ZpZGVyO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgJHdpbmRvdy5vblNlcnZlciA9PT0gJ3VuZGVmaW5lZCcgJiYgIHR5cGVvZiAkd2luZG93LiRhbmd1bGFyU2VydmVyQ2FjaGUgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBjb25zb2xlLmxvZygnU0hPVUxEIExPQUQgQ0FDSEUgIScpO1xuXG4gICAgICAgICRjYWNoZUZhY3RvcnlQcm92aWRlci5pbXBvcnRBbGwoJHdpbmRvdy4kYW5ndWxhclNlcnZlckNhY2hlKTtcblxuICAgICAgICAkd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ1N0YWNrUXVldWVFbXB0eScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsZWFyaW5nIGNhY2hlIG5vdycpXG4gICAgICAgICAgICAkY2FjaGVGYWN0b3J5UHJvdmlkZXIucmVtb3ZlKCckaHR0cCcpO1xuICAgICAgICAgICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5jYWNoZSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59KTtcbi8qXG5cbndpbmRvd1ttb2R1bGVOYW1lXS5jb25maWcoZnVuY3Rpb24oICRodHRwUHJvdmlkZXIsICRDYWNoZUZhY3RvcnlQcm92aWRlciwgJFRlbXBsYXRlQ2FjaGVQcm92aWRlciwgJFNlcnZlckNhY2hlUHJvdmlkZXIpIHtcblxuICAgIGNvbnNvbGUubG9nKCdNeUNhY2hlUHJvdmlkZXInLCAkQ2FjaGVGYWN0b3J5UHJvdmlkZXIpO1xuICAgIGNvbnNvbGUubG9nKCckVGVtcGxhdGVDYWNoZVByb3ZpZGVyJywgJFRlbXBsYXRlQ2FjaGVQcm92aWRlcik7XG4gICAgY29uc29sZS5sb2coJyRTZXJ2ZXJDYWNoZVByb3ZpZGVyJywgJFNlcnZlckNhY2hlUHJvdmlkZXIpO1xuXG4gICAgdmFyIGNhY2hlRmFjdG9yeSA9ICRDYWNoZUZhY3RvcnlQcm92aWRlci4kZ2V0O1xuXG4gICAgY29uc29sZS5sb2coJ2NhY2hlRmFjdG9yeScsIGNhY2hlRmFjdG9yeSk7XG5cbiAgICB2YXIgc2VydmVyQ2FjaGUgPSBjYWNoZUZhY3RvcnkoJ3NlcnZlcicpO1xuXG4gICAgY29uc29sZS5sb2coJ3NlcnZlckNhY2hlID0gJywgc2VydmVyQ2FjaGUpO1xuXG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5jYWNoZSA9IHNlcnZlckNhY2hlO1xuXG5cbiAgICBmdW5jdGlvbiBpbnRlcmNlcHRIdHRwKCAkcSApIHtcbiAgICAgICAgcmV0dXJuKHtcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgICByZXF1ZXN0RXJyb3I6IHJlcXVlc3RFcnJvcixcbiAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IHJlc3BvbnNlRXJyb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCggY29uZmlnICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1N0YXRpbmcgcmVxdWVzdCcsIGNvbmZpZyk7XG4gICAgICAgICAgICBpZiAoIWNvbmZpZy5jYWNoZSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5jYWNoZSA9IHNlcnZlckNhY2hlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuKCBjb25maWcgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3RFcnJvciggcmVqZWN0aW9uICkge1xuICAgICAgICAgICAgcmV0dXJuKCAkcS5yZWplY3QoIHJlamVjdGlvbiApICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZXNwb25zZSggcmVzcG9uc2UgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ2V0dGluZyByZXNwb25zZScsIHJlc3BvbnNlKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXNwb25zZS5jb25maWcuY2FjaGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhY2hlID0gcmVzcG9uc2UuY29uZmlnLmNhY2hlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhY2hlLmluZm8oKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyBjYWNoZSBvYmplY3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiggcmVzcG9uc2UgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlRXJyb3IoIHJlc3BvbnNlICkge1xuICAgICAgICAgICAgcmV0dXJuKCAkcS5yZWplY3QoIHJlc3BvbnNlICkgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goIGludGVyY2VwdEh0dHAgKTtcblxufSk7XG4qL1xuLypcbndpbmRvd1ttb2R1bGVOYW1lXS5jb25maWcoZnVuY3Rpb24oICRpbmplY3RvciwgJGh0dHBQcm92aWRlciwgJGNhY2hlRmFjdG9yeVByb3ZpZGVyKSB7XG5cblxuICAgIHZhciBteUluamVjdG9yID0gYW5ndWxhci5pbmplY3RvcihbJ25nJ10pO1xuICAgIC8vY29uc29sZS5sb2coJ215SW5qZWN0b3IgPSAnLCBteUluamVjdG9yKTtcblxuICAgIHZhciBjYWNoZUZhY3RvcnkgPSAkY2FjaGVGYWN0b3J5UHJvdmlkZXIuJGdldDtcbiAgICAvL2NvbnNvbGUubG9nKGNhY2hlRmFjdG9yeSk7XG5cbiAgICB2YXIgc2VydmVyQ2FjaGUgPSBjYWNoZUZhY3RvcnkoJ3NlcnZlcicpO1xuXG4gICAgdmFyIGtleXMgPSB7fTtcblxuICAgIHZhciBhZGRLZXkgPSBmdW5jdGlvbihrZXkpIHtcblxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbnRlcmNlcHRIdHRwKCAkcSApIHtcbiAgICAgICAgcmV0dXJuKHtcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgICByZXF1ZXN0RXJyb3I6IHJlcXVlc3RFcnJvcixcbiAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IHJlc3BvbnNlRXJyb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCggY29uZmlnICkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnU3RhdGluZyByZXF1ZXN0JywgY29uZmlnKTtcbiAgICAgICAgICAgIGlmICghY29uZmlnLmNhY2hlKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmNhY2hlID0gc2VydmVyQ2FjaGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4oIGNvbmZpZyApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEVycm9yKCByZWplY3Rpb24gKSB7XG4gICAgICAgICAgICByZXR1cm4oICRxLnJlamVjdCggcmVqZWN0aW9uICkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlKCByZXNwb25zZSApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2dldHRpbmcgcmVzcG9uc2UnLCByZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UuY29uZmlnLmNhY2hlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciBjYWNoZSA9IHJlc3BvbnNlLmNvbmZpZy5jYWNoZTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNhY2hlLmluZm8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4oIHJlc3BvbnNlICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZXNwb25zZUVycm9yKCByZXNwb25zZSApIHtcbiAgICAgICAgICAgIHJldHVybiggJHEucmVqZWN0KCByZXNwb25zZSApICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCBpbnRlcmNlcHRIdHRwICk7XG59KTtcblxuKi9cbi8qKiBEcmVhbVxuXG5pZiAoIHR5cGVvZiB3aW5kb3cub25TZXJ2ZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgQW5ndWxhckNsaWVudChhbmd1bGFyLCBkb2N1bWVudCwgMTAwKTtcbn1cbiAqL1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gMTcvMDIvMTYuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3RvcigkbG9nKSB7XG5cbiAgICAgICAgY29uc3QgZXJyb3IxID0gJ0NhdGNoYWJsZSBFcnJvcigpJztcbiAgICAgICAgY29uc3QgZXJyb3IyID0gJ0NhdGNoYWJsZSBFeGNlcHRpb24oKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMyA9ICdVbmNhdGNoYWJsZSBFcnJvcigpIC0gc2hvdWxkIGNyYXNoIHRoZSBhcHAuJztcblxuICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IxKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKGVycm9yMSlcbiAgICAgICAgfSBjYXRjaCAoZTEpIHtcbiAgICAgICAgICAgICRsb2cubG9nKCdJIGNhdGNoZWQgYW4gRXJyb3IvRXhjZXB0aW9uOiAnICsgZTEgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMik7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZTIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUyICk7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMyk7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yID0gKHRleHQpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH07XG5cbiAgICB0aHJvd0V4Y2VwdGlvbiA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IHRleHQ7XG4gICAgfTtcblxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cblxuY2xhc3MgTWFpbkN0cmwge1xuICAgIGNvbnN0cnVjdG9yKCRsb2cpe1xuXG4gICAgICAgICRsb2cubG9nKCdJIGFtIGEgbG9nJywgJ3dpdGggdHdvIHBhcmFtZXRlcnMnKTtcbiAgICAgICAgJGxvZy53YXJuKCdJIGFtIGEgd2FybicpO1xuICAgICAgICAkbG9nLmluZm8oJ0kgYW0gYW4gaW5mbycpO1xuICAgICAgICAvKiRsb2cuZXJyb3IoJ0kgYW0gZXJyb3Igd2l0aCBhbiBvYmplY3QnLCB7XG4gICAgICAgICAgICBuYW1lOiAndmFsdWUnXG4gICAgICAgIH0pOyovXG5cblxuICAgIH1cblxuICAgIHRpdGxlID0gJ0FuZ3VsYXIgRXM2IHJldmlzaXRlZCc7XG59XG5leHBvcnQgZGVmYXVsdCBNYWluQ3RybDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvZG9DdHJsIHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUb2RvQ3RybCBMb2FkZWQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhZGRUb2RvID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZG9zLnB1c2goe3RleHQ6dGhpcy50b2RvVGV4dCwgZG9uZTpmYWxzZX0pO1xuICAgICAgICB0aGlzLnRvZG9UZXh0ID0gJyc7XG4gICAgfTtcblxuXG4gICAgdGl0bGUgPSBcIlRvZG9zIHRpdGxlXCI7XG5cbiAgICB0b2RvcyA9IFtcbiAgICAgICAge3RleHQ6J2xlYXJuIGFuZ3VsYXInLCBkb25lOnRydWV9LFxuICAgICAgICB7dGV4dDonYnVpbGQgYW4gYW5ndWxhciBhcHAnLCBkb25lOmZhbHNlfV07XG5cbiAgICB0b2RvVGV4dCA9ICcnO1xuXG5cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXY+PHNwYW4gbmctc2hvdz1cImxvYWRpbmdcIj5sb2FkaW5nIHByb2R1Y3RzPC9zcGFuPiA8bGkgbmctcmVwZWF0PVwicHJvZHVjdCBpbiBwcm9kdWN0c1wiPnt7cHJvZHVjdC5uYW1lfX0ge3twcm9kdWN0LnByaWNlfX08L2xpPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdodHRwOi8vYXBpLmV4YW1wbGU6ODA4MC9wcm9kdWN0cycpLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5wcm9kdWN0cyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImV4cG9ydCBmdW5jdGlvbiAkQ2FjaGVGYWN0b3J5UHJvdmlkZXIoKSB7XG5cbiAgICB2YXIgY2FjaGVzID0ge307XG5cbiAgICB0aGlzLmdldENhY2hlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2FjaGVzO1xuICAgIH07XG5cbiAgICB0aGlzLmV4cG9ydCA9IGZ1bmN0aW9uKGNhY2hlSWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWNoZVtjYWNoZUlkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignJGNhY2hlRmFjdG9yeSAtIGlpZCAtIENhY2hlSWQgJytjYWNoZUlkKycgaXMgbm90IGRlZmluZWQhJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlc1tjYWNoZUlkXS5leHBvcnQoKTtcblxuICAgIH07XG5cbiAgICB0aGlzLmV4cG9ydEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2NhY2hlcyA9IHt9O1xuICAgICAgICBmb3IodmFyIGkgaW4gY2FjaGVzKSB7XG4gICAgICAgICAgICBfY2FjaGVzW2ldID0gY2FjaGVzW2ldLmV4cG9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfY2FjaGVzO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKGNhY2hlSWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWNoZXNbY2FjaGVJZF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBkZWxldGUgY2FjaGVzW2NhY2hlSWRdO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdGhpcy5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FjaGVzID0ge307XG4gICAgfTtcblxuICAgIHRoaXMuaW1wb3J0QWxsID0gZnVuY3Rpb24oY2FjaGVEYXRhKSB7XG5cbiAgICAgICAgdmFyIGNhY2hlRmFjdG9yeSA9IHRoaXMuJGdldCgpO1xuICAgICAgICBmb3IodmFyIGkgaW4gY2FjaGVEYXRhKSB7XG4gICAgICAgICAgICBpZih0eXBlb2YgY2FjaGVzW2ldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNhY2hlc1tpXSA9IGNhY2hlRmFjdG9yeShpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhY2hlc1tpXS5pbXBvcnQoY2FjaGVEYXRhW2ldKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmltcG9ydCA9IGZ1bmN0aW9uKGNhY2hlSWQsIGNhY2hlRGF0YSkge1xuXG4gICAgICAgIHZhciBjYWNoZUZhY3RvcnkgPSB0aGlzLiRnZXQoKTtcbiAgICAgICAgaWYodHlwZW9mIGNhY2hlc1tjYWNoZUlkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNhY2hlc1tjYWNoZUlkXSA9IGNhY2hlRmFjdG9yeShpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhY2hlc1tjYWNoZUlkXS5pbXBvcnQoY2FjaGVEYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5pbmZvID0gZnVuY3Rpb24oY2FjaGVJZCkge1xuICAgICAgICBpZih0eXBlb2YgY2FjaGVzW2NhY2hlSWRdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCckY2FjaGVGYWN0b3J5IC0gaWlkIC0gQ2FjaGVJZCAnK2NhY2hlSWQrJyBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVzW2NhY2hlSWRdLmluZm8oKTtcbiAgICB9O1xuXG4gICAgdGhpcy5pbmZvQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbmZvID0ge307XG4gICAgICAgIGZvciAodmFyIGNhY2hlSWQgIGluIGNhY2hlcykge1xuICAgICAgICAgICAgaW5mb1tjYWNoZUlkXSA9IGNhY2hlc1tjYWNoZUlkXS5pbmZvKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZm87XG4gICAgfTtcblxuICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuXG5cbiAgICAgICAgZnVuY3Rpb24gY2FjaGVGYWN0b3J5KGNhY2hlSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChjYWNoZUlkIGluIGNhY2hlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZXNbY2FjaGVJZF07XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCckY2FjaGVGYWN0b3J5IC0gaWlkIC0gQ2FjaGVJZCAnK2NhY2hlSWQrJyBpcyBhbHJlYWR5IHRha2VuIScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IDAsXG4gICAgICAgICAgICAgICAgc3RhdHMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7aWQ6IGNhY2hlSWR9KSxcbiAgICAgICAgICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgICAgICAgICAgICBjYXBhY2l0eSA9IChvcHRpb25zICYmIG9wdGlvbnMuY2FwYWNpdHkpIHx8IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICAgICAgbHJ1SGFzaCA9IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgICAgICAgICAgICAgZnJlc2hFbmQgPSBudWxsLFxuICAgICAgICAgICAgICAgIHN0YWxlRW5kID0gbnVsbDtcblxuXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVzW2NhY2hlSWRdID0ge1xuXG4gICAgICAgICAgICAgICAgcHV0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FwYWNpdHkgPCBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbHJ1RW50cnkgPSBscnVIYXNoW2tleV0gfHwgKGxydUhhc2hba2V5XSA9IHtrZXk6IGtleX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaChscnVFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gZGF0YSkpIHNpemUrKztcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiBjYXBhY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoc3RhbGVFbmQua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZXhwb3J0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGltcG9ydDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzaXplID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbHJ1SGFzaCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIGZyZXNoRW5kID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgc3RhbGVFbmQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXQoaSwgZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcGFjaXR5IDwgTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxydUVudHJ5ID0gbHJ1SGFzaFtrZXldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxydUVudHJ5KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnJlc2gobHJ1RW50cnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcGFjaXR5IDwgTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxydUVudHJ5ID0gbHJ1SGFzaFtrZXldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxydUVudHJ5KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChscnVFbnRyeSA9PT0gZnJlc2hFbmQpIGZyZXNoRW5kID0gbHJ1RW50cnkucDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChscnVFbnRyeSA9PT0gc3RhbGVFbmQpIHN0YWxlRW5kID0gbHJ1RW50cnkubjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsobHJ1RW50cnkubixscnVFbnRyeS5wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGxydUhhc2hba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBkYXRhKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHNpemUtLTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVtb3ZlQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHNpemUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBscnVIYXNoID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgZnJlc2hFbmQgPSBzdGFsZUVuZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBscnVIYXNoID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNhY2hlc1tjYWNoZUlkXTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0cywge3NpemU6IHNpemV9KTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAga2V5czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIG1ha2VzIHRoZSBgZW50cnlgIHRoZSBmcmVzaEVuZCBvZiB0aGUgTFJVIGxpbmtlZCBsaXN0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlZnJlc2goZW50cnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkgIT09IGZyZXNoRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhbGVFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWxlRW5kID0gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhbGVFbmQgPT09IGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFsZUVuZCA9IGVudHJ5Lm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsaW5rKGVudHJ5Lm4sIGVudHJ5LnApO1xuICAgICAgICAgICAgICAgICAgICBsaW5rKGVudHJ5LCBmcmVzaEVuZCk7XG4gICAgICAgICAgICAgICAgICAgIGZyZXNoRW5kID0gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgIGZyZXNoRW5kLm4gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBiaWRpcmVjdGlvbmFsbHkgbGlua3MgdHdvIGVudHJpZXMgb2YgdGhlIExSVSBsaW5rZWQgbGlzdFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbiBsaW5rKG5leHRFbnRyeSwgcHJldkVudHJ5KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRFbnRyeSAhPT0gcHJldkVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0RW50cnkpIG5leHRFbnRyeS5wID0gcHJldkVudHJ5OyAvL3Agc3RhbmRzIGZvciBwcmV2aW91cywgJ3ByZXYnIGRpZG4ndCBtaW5pZnlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZFbnRyeSkgcHJldkVudHJ5Lm4gPSBuZXh0RW50cnk7IC8vbiBzdGFuZHMgZm9yIG5leHQsICduZXh0JyBkaWRuJ3QgbWluaWZ5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FjaGVGYWN0b3J5LmluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpbmZvID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBjYWNoZUlkICBpbiBjYWNoZXMpIHtcbiAgICAgICAgICAgICAgICBpbmZvW2NhY2hlSWRdID0gY2FjaGVzW2NhY2hlSWRdLmluZm8oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBjYWNoZUZhY3Rvcnk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uICRUZW1wbGF0ZUNhY2hlUHJvdmlkZXIoKSB7XG4gICAgdGhpcy4kZ2V0ID0gWyckY2FjaGVGYWN0b3J5JywgZnVuY3Rpb24oJGNhY2hlRmFjdG9yeSkge1xuICAgICAgICByZXR1cm4gJGNhY2hlRmFjdG9yeSgndGVtcGxhdGVzJyk7XG4gICAgfV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiAkU2VydmVyQ2FjaGVQcm92aWRlcigpIHtcbiAgICB0aGlzLiRnZXQgPSBbJyRjYWNoZUZhY3RvcnknLCBmdW5jdGlvbigkY2FjaGVGYWN0b3J5KSB7XG4gICAgICAgIHJldHVybiAkY2FjaGVGYWN0b3J5KCdzZXJ2ZXInKTtcbiAgICB9XTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cbmltcG9ydCBNYWluQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuXG4vL2ltcG9ydCB7SW5qZWN0U2VydmVyfSBmcm9tICcuLi9hbmd1bGFyL3NlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHNjZVByb3ZpZGVyKSB7XG5cblxuICAgICRzY2VQcm92aWRlci5lbmFibGVkKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9NYWluJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy92aWV3cy9wcm9kdWN0cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTWFpbkN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL1RvZG8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3RvZG9zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBUb2RvQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvRXJyb3InLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL2Vycm9yLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBFcnJvckN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKCcvTWFpbicpO1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG59OyJdfQ==
