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

var app = angular.module(moduleName, ['ngResource', 'ngRoute']).config(_routes2.default).controller('MainCtrl', _Main2.default).controller('TodoCtrl', _Todo2.default).controller('ErrorCtrl', _Error2.default).provider('$cacheFactory', _ngCacheFactory.$CacheFactoryProvider).provider('$templateCache', _ngCacheFactory.$TemplateCacheProvider).directive('productList', _ProductList2.default);

console.log('URL = ', window.location.href);

app.config(["$windowProvider", "$httpProvider", "$cacheFactoryProvider", function ($windowProvider, $httpProvider, $cacheFactoryProvider) {

    $httpProvider.defaults.cache = true;

    var $window = $windowProvider.$get();

    if ($window.onServer && $window.onServer === true) {
        $window.$cacheFactoryProvider = $cacheFactoryProvider;
    }

    if (typeof $window.onServer === 'undefined' && typeof $window.$angularServerCache !== 'undefined') {

        $cacheFactoryProvider.importAll($window.$angularServerCache);

        $window.addEventListener('StackQueueEmpty', function () {
            $cacheFactoryProvider.remove('$http');
            $httpProvider.defaults.cache = true;
        });
    }
}]);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXBwLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL01haW4uanMiLCJjbGllbnQvY29udHJvbGxlcnMvVG9kby5qcyIsImNsaWVudC9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwiY2xpZW50L3Byb3ZpZGVyL25nQ2FjaGVGYWN0b3J5LmpzIiwiY2xpZW50L3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUFPQSxJQUFJLE1BQU0sUUFBQSxBQUFRLE9BQVIsQUFBZSxZQUFZLENBQUEsQUFBQyxjQUE1QixBQUEyQixBQUFlLFlBQTFDLEFBQ0wseUJBREssQUFFTCxXQUZLLEFBRU0sNEJBRk4sQUFHTCxXQUhLLEFBR00sNEJBSE4sQUFJTCxXQUpLLEFBSU0sOEJBSk4sQUFLTCxTQUxLLEFBS0ksd0RBTEosQUFNTCxTQU5LLEFBTUksMERBTkosQUFPTCxVQVBLLEFBT0ssNkJBUGY7O0FBU0EsUUFBQSxBQUFRLElBQVIsQUFBWSxVQUFVLE9BQUEsQUFBTyxTQUE3QixBQUFzQzs7QUFFdEMsSUFBQSxBQUFJLE9BQU8sVUFBQSxBQUFTLGlCQUFULEFBQTBCLGVBQTFCLEFBQXlDLHVCQUF1QixBQUV2RTs7a0JBQUEsQUFBYyxTQUFkLEFBQXVCLFFBQXZCLEFBQStCLEFBRS9COztRQUFJLFVBQVUsZ0JBQWQsQUFBYyxBQUFnQixBQUU5Qjs7UUFBSSxRQUFBLEFBQVEsWUFBWSxRQUFBLEFBQVEsYUFBaEMsQUFBNkMsTUFBTSxBQUMvQztnQkFBQSxBQUFRLHdCQUFSLEFBQWdDLEFBQ25DLEFBRUQ7OztRQUFJLE9BQU8sUUFBUCxBQUFlLGFBQWYsQUFBNEIsZUFBZ0IsT0FBTyxRQUFQLEFBQWUsd0JBQS9ELEFB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Ozs7a0JDMU5jLFVBQVMsY0FBVCxFQUF5QixpQkFBekIsRUFBNEMsWUFBNUMsRUFBMEQ7O0FBR3JFLGlCQUFhLE9BQWIsQ0FBcUIsS0FBckI7O0FBRUEsbUJBQWUsSUFBZixDQUFvQixPQUFwQixFQUE2QjtBQUN6QixxQkFBYSxzQkFEWTtBQUV6QixrQ0FGeUI7QUFHekIsc0JBQWM7QUFIVyxLQUE3Qjs7QUFNQSxtQkFBZSxJQUFmLENBQW9CLE9BQXBCLEVBQTZCO0FBQ3pCLHFCQUFhLG1CQURZO0FBRXpCLGtDQUZ5QjtBQUd6QixzQkFBYztBQUhXLEtBQTdCOztBQU1BLG1CQUFlLElBQWYsQ0FBb0IsUUFBcEIsRUFBOEI7QUFDMUIscUJBQWEsbUJBRGE7QUFFMUIsbUNBRjBCO0FBRzFCLHNCQUFjO0FBSFksS0FBOUI7O0FBTUEsbUJBQWUsU0FBZixDQUF5QixPQUF6Qjs7QUFFQSxzQkFBa0IsU0FBbEIsQ0FBNEIsSUFBNUI7QUFFSCxDOztBQWpDRDs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7OztBQStCQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuaW1wb3J0IE1haW5DdHJsICBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsICBmcm9tICcuL2NvbnRyb2xsZXJzL1RvZG8nO1xuaW1wb3J0IFJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgUHJvZHVjdExpc3QgZnJvbSAnLi9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0JztcbmltcG9ydCB7JENhY2hlRmFjdG9yeVByb3ZpZGVyLCAkVGVtcGxhdGVDYWNoZVByb3ZpZGVyfSBmcm9tICcuL3Byb3ZpZGVyL25nQ2FjaGVGYWN0b3J5JztcblxuXG4vLyBkcmVhbVxuLy9pbXBvcnQgeyBBbmd1bGFyQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQnO1xuXG5cbnZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZShtb2R1bGVOYW1lLCBbJ25nUmVzb3VyY2UnLCAnbmdSb3V0ZSddKVxuICAgIC5jb25maWcoUm91dGVzKVxuICAgIC5jb250cm9sbGVyKCdNYWluQ3RybCcsIE1haW5DdHJsKVxuICAgIC5jb250cm9sbGVyKCdUb2RvQ3RybCcsIFRvZG9DdHJsKVxuICAgIC5jb250cm9sbGVyKCdFcnJvckN0cmwnLCBFcnJvckN0cmwpXG4gICAgLnByb3ZpZGVyKCckY2FjaGVGYWN0b3J5JywgJENhY2hlRmFjdG9yeVByb3ZpZGVyKVxuICAgIC5wcm92aWRlcignJHRlbXBsYXRlQ2FjaGUnLCAkVGVtcGxhdGVDYWNoZVByb3ZpZGVyKVxuICAgIC5kaXJlY3RpdmUoJ3Byb2R1Y3RMaXN0JywgUHJvZHVjdExpc3QpO1xuXG5jb25zb2xlLmxvZygnVVJMID0gJywgd2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCR3aW5kb3dQcm92aWRlciwgJGh0dHBQcm92aWRlciwgJGNhY2hlRmFjdG9yeVByb3ZpZGVyKSB7XG5cbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmNhY2hlID0gdHJ1ZTtcblxuICAgIHZhciAkd2luZG93ID0gJHdpbmRvd1Byb3ZpZGVyLiRnZXQoKTtcblxuICAgIGlmICgkd2luZG93Lm9uU2VydmVyICYmICR3aW5kb3cub25TZXJ2ZXIgPT09IHRydWUpIHtcbiAgICAgICAgJHdpbmRvdy4kY2FjaGVGYWN0b3J5UHJvdmlkZXIgPSAkY2FjaGVGYWN0b3J5UHJvdmlkZXI7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiAkd2luZG93Lm9uU2VydmVyID09PSAndW5kZWZpbmVkJyAmJiAgdHlwZW9mICR3aW5kb3cuJGFuZ3VsYXJTZXJ2ZXJDYWNoZSAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cbiAgICAgICAgJGNhY2hlRmFjdG9yeVByb3ZpZGVyLmltcG9ydEFsbCgkd2luZG93LiRhbmd1bGFyU2VydmVyQ2FjaGUpO1xuXG4gICAgICAgICR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignU3RhY2tRdWV1ZUVtcHR5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkY2FjaGVGYWN0b3J5UHJvdmlkZXIucmVtb3ZlKCckaHR0cCcpO1xuICAgICAgICAgICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5jYWNoZSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxufSk7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gMTcvMDIvMTYuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3RvcigkbG9nKSB7XG5cbiAgICAgICAgY29uc3QgZXJyb3IxID0gJ0NhdGNoYWJsZSBFcnJvcigpJztcbiAgICAgICAgY29uc3QgZXJyb3IyID0gJ0NhdGNoYWJsZSBFeGNlcHRpb24oKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMyA9ICdVbmNhdGNoYWJsZSBFcnJvcigpIC0gc2hvdWxkIGNyYXNoIHRoZSBhcHAuJztcblxuICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IxKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKGVycm9yMSlcbiAgICAgICAgfSBjYXRjaCAoZTEpIHtcbiAgICAgICAgICAgICRsb2cubG9nKCdJIGNhdGNoZWQgYW4gRXJyb3IvRXhjZXB0aW9uOiAnICsgZTEgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMik7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZTIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUyICk7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMyk7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yID0gKHRleHQpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH07XG5cbiAgICB0aHJvd0V4Y2VwdGlvbiA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IHRleHQ7XG4gICAgfTtcblxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cblxuY2xhc3MgTWFpbkN0cmwge1xuICAgIGNvbnN0cnVjdG9yKCRsb2cpe1xuXG4gICAgICAgICRsb2cubG9nKCdJIGFtIGEgbG9nJywgJ3dpdGggdHdvIHBhcmFtZXRlcnMnKTtcbiAgICAgICAgJGxvZy53YXJuKCdJIGFtIGEgd2FybicpO1xuICAgICAgICAkbG9nLmluZm8oJ0kgYW0gYW4gaW5mbycpO1xuICAgICAgICAvKiRsb2cuZXJyb3IoJ0kgYW0gZXJyb3Igd2l0aCBhbiBvYmplY3QnLCB7XG4gICAgICAgICAgICBuYW1lOiAndmFsdWUnXG4gICAgICAgIH0pOyovXG5cblxuICAgIH1cblxuICAgIHRpdGxlID0gJ0FuZ3VsYXIgRXM2IHJldmlzaXRlZCc7XG59XG5leHBvcnQgZGVmYXVsdCBNYWluQ3RybDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvZG9DdHJsIHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUb2RvQ3RybCBMb2FkZWQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhZGRUb2RvID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZG9zLnB1c2goe3RleHQ6dGhpcy50b2RvVGV4dCwgZG9uZTpmYWxzZX0pO1xuICAgICAgICB0aGlzLnRvZG9UZXh0ID0gJyc7XG4gICAgfTtcblxuXG4gICAgdGl0bGUgPSBcIlRvZG9zIHRpdGxlXCI7XG5cbiAgICB0b2RvcyA9IFtcbiAgICAgICAge3RleHQ6J2xlYXJuIGFuZ3VsYXInLCBkb25lOnRydWV9LFxuICAgICAgICB7dGV4dDonYnVpbGQgYW4gYW5ndWxhciBhcHAnLCBkb25lOmZhbHNlfV07XG5cbiAgICB0b2RvVGV4dCA9ICcnO1xuXG5cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXY+PHNwYW4gbmctc2hvdz1cImxvYWRpbmdcIj5sb2FkaW5nIHByb2R1Y3RzPC9zcGFuPiA8bGkgbmctcmVwZWF0PVwicHJvZHVjdCBpbiBwcm9kdWN0c1wiPnt7cHJvZHVjdC5uYW1lfX0ge3twcm9kdWN0LnByaWNlfX08L2xpPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdodHRwOi8vYXBpLmV4YW1wbGU6ODA4MC9wcm9kdWN0cycpLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5wcm9kdWN0cyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImV4cG9ydCBmdW5jdGlvbiAkQ2FjaGVGYWN0b3J5UHJvdmlkZXIoKSB7XG5cbiAgICB2YXIgY2FjaGVzID0ge307XG5cbiAgICB0aGlzLmdldENhY2hlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2FjaGVzO1xuICAgIH07XG5cbiAgICB0aGlzLmV4cG9ydCA9IGZ1bmN0aW9uKGNhY2hlSWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWNoZVtjYWNoZUlkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignJGNhY2hlRmFjdG9yeSAtIGlpZCAtIENhY2hlSWQgJytjYWNoZUlkKycgaXMgbm90IGRlZmluZWQhJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlc1tjYWNoZUlkXS5leHBvcnQoKTtcblxuICAgIH07XG5cbiAgICB0aGlzLmV4cG9ydEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2NhY2hlcyA9IHt9O1xuICAgICAgICBmb3IodmFyIGkgaW4gY2FjaGVzKSB7XG4gICAgICAgICAgICBfY2FjaGVzW2ldID0gY2FjaGVzW2ldLmV4cG9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfY2FjaGVzO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKGNhY2hlSWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWNoZXNbY2FjaGVJZF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBkZWxldGUgY2FjaGVzW2NhY2hlSWRdO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdGhpcy5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2FjaGVzID0ge307XG4gICAgfTtcblxuICAgIHRoaXMuaW1wb3J0QWxsID0gZnVuY3Rpb24oY2FjaGVEYXRhKSB7XG5cbiAgICAgICAgdmFyIGNhY2hlRmFjdG9yeSA9IHRoaXMuJGdldCgpO1xuICAgICAgICBmb3IodmFyIGkgaW4gY2FjaGVEYXRhKSB7XG4gICAgICAgICAgICBpZih0eXBlb2YgY2FjaGVzW2ldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGNhY2hlc1tpXSA9IGNhY2hlRmFjdG9yeShpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhY2hlc1tpXS5pbXBvcnQoY2FjaGVEYXRhW2ldKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmltcG9ydCA9IGZ1bmN0aW9uKGNhY2hlSWQsIGNhY2hlRGF0YSkge1xuXG4gICAgICAgIHZhciBjYWNoZUZhY3RvcnkgPSB0aGlzLiRnZXQoKTtcbiAgICAgICAgaWYodHlwZW9mIGNhY2hlc1tjYWNoZUlkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNhY2hlc1tjYWNoZUlkXSA9IGNhY2hlRmFjdG9yeShpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhY2hlc1tjYWNoZUlkXS5pbXBvcnQoY2FjaGVEYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5pbmZvID0gZnVuY3Rpb24oY2FjaGVJZCkge1xuICAgICAgICBpZih0eXBlb2YgY2FjaGVzW2NhY2hlSWRdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCckY2FjaGVGYWN0b3J5IC0gaWlkIC0gQ2FjaGVJZCAnK2NhY2hlSWQrJyBpcyBub3QgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVzW2NhY2hlSWRdLmluZm8oKTtcbiAgICB9O1xuXG4gICAgdGhpcy5pbmZvQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbmZvID0ge307XG4gICAgICAgIGZvciAodmFyIGNhY2hlSWQgIGluIGNhY2hlcykge1xuICAgICAgICAgICAgaW5mb1tjYWNoZUlkXSA9IGNhY2hlc1tjYWNoZUlkXS5pbmZvKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZm87XG4gICAgfTtcblxuICAgIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCkge1xuXG5cbiAgICAgICAgZnVuY3Rpb24gY2FjaGVGYWN0b3J5KGNhY2hlSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChjYWNoZUlkIGluIGNhY2hlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZXNbY2FjaGVJZF07XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCckY2FjaGVGYWN0b3J5IC0gaWlkIC0gQ2FjaGVJZCAnK2NhY2hlSWQrJyBpcyBhbHJlYWR5IHRha2VuIScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IDAsXG4gICAgICAgICAgICAgICAgc3RhdHMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7aWQ6IGNhY2hlSWR9KSxcbiAgICAgICAgICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgICAgICAgICAgICBjYXBhY2l0eSA9IChvcHRpb25zICYmIG9wdGlvbnMuY2FwYWNpdHkpIHx8IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICAgICAgbHJ1SGFzaCA9IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgICAgICAgICAgICAgZnJlc2hFbmQgPSBudWxsLFxuICAgICAgICAgICAgICAgIHN0YWxlRW5kID0gbnVsbDtcblxuXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVzW2NhY2hlSWRdID0ge1xuXG4gICAgICAgICAgICAgICAgcHV0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FwYWNpdHkgPCBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbHJ1RW50cnkgPSBscnVIYXNoW2tleV0gfHwgKGxydUhhc2hba2V5XSA9IHtrZXk6IGtleX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaChscnVFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gZGF0YSkpIHNpemUrKztcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemUgPiBjYXBhY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoc3RhbGVFbmQua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZXhwb3J0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGltcG9ydDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzaXplID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbHJ1SGFzaCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIGZyZXNoRW5kID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgc3RhbGVFbmQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgaW4gZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXQoaSwgZGF0YVtpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcGFjaXR5IDwgTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxydUVudHJ5ID0gbHJ1SGFzaFtrZXldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxydUVudHJ5KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnJlc2gobHJ1RW50cnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcGFjaXR5IDwgTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxydUVudHJ5ID0gbHJ1SGFzaFtrZXldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxydUVudHJ5KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChscnVFbnRyeSA9PT0gZnJlc2hFbmQpIGZyZXNoRW5kID0gbHJ1RW50cnkucDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChscnVFbnRyeSA9PT0gc3RhbGVFbmQpIHN0YWxlRW5kID0gbHJ1RW50cnkubjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsobHJ1RW50cnkubixscnVFbnRyeS5wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGxydUhhc2hba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBkYXRhKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHNpemUtLTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVtb3ZlQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHNpemUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBscnVIYXNoID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgZnJlc2hFbmQgPSBzdGFsZUVuZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBscnVIYXNoID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNhY2hlc1tjYWNoZUlkXTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0cywge3NpemU6IHNpemV9KTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAga2V5czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIG1ha2VzIHRoZSBgZW50cnlgIHRoZSBmcmVzaEVuZCBvZiB0aGUgTFJVIGxpbmtlZCBsaXN0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlZnJlc2goZW50cnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkgIT09IGZyZXNoRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhbGVFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWxlRW5kID0gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhbGVFbmQgPT09IGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFsZUVuZCA9IGVudHJ5Lm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsaW5rKGVudHJ5Lm4sIGVudHJ5LnApO1xuICAgICAgICAgICAgICAgICAgICBsaW5rKGVudHJ5LCBmcmVzaEVuZCk7XG4gICAgICAgICAgICAgICAgICAgIGZyZXNoRW5kID0gZW50cnk7XG4gICAgICAgICAgICAgICAgICAgIGZyZXNoRW5kLm4gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBiaWRpcmVjdGlvbmFsbHkgbGlua3MgdHdvIGVudHJpZXMgb2YgdGhlIExSVSBsaW5rZWQgbGlzdFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbiBsaW5rKG5leHRFbnRyeSwgcHJldkVudHJ5KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRFbnRyeSAhPT0gcHJldkVudHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0RW50cnkpIG5leHRFbnRyeS5wID0gcHJldkVudHJ5OyAvL3Agc3RhbmRzIGZvciBwcmV2aW91cywgJ3ByZXYnIGRpZG4ndCBtaW5pZnlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZFbnRyeSkgcHJldkVudHJ5Lm4gPSBuZXh0RW50cnk7IC8vbiBzdGFuZHMgZm9yIG5leHQsICduZXh0JyBkaWRuJ3QgbWluaWZ5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FjaGVGYWN0b3J5LmluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpbmZvID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBjYWNoZUlkICBpbiBjYWNoZXMpIHtcbiAgICAgICAgICAgICAgICBpbmZvW2NhY2hlSWRdID0gY2FjaGVzW2NhY2hlSWRdLmluZm8oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBjYWNoZUZhY3Rvcnk7XG4gICAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uICRUZW1wbGF0ZUNhY2hlUHJvdmlkZXIoKSB7XG4gICAgdGhpcy4kZ2V0ID0gWyckY2FjaGVGYWN0b3J5JywgZnVuY3Rpb24oJGNhY2hlRmFjdG9yeSkge1xuICAgICAgICByZXR1cm4gJGNhY2hlRmFjdG9yeSgndGVtcGxhdGVzJyk7XG4gICAgfV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiAkU2VydmVyQ2FjaGVQcm92aWRlcigpIHtcbiAgICB0aGlzLiRnZXQgPSBbJyRjYWNoZUZhY3RvcnknLCBmdW5jdGlvbigkY2FjaGVGYWN0b3J5KSB7XG4gICAgICAgIHJldHVybiAkY2FjaGVGYWN0b3J5KCdzZXJ2ZXInKTtcbiAgICB9XTtcbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cbmltcG9ydCBNYWluQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuXG4vL2ltcG9ydCB7SW5qZWN0U2VydmVyfSBmcm9tICcuLi9hbmd1bGFyL3NlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHNjZVByb3ZpZGVyKSB7XG5cblxuICAgICRzY2VQcm92aWRlci5lbmFibGVkKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9NYWluJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy92aWV3cy9wcm9kdWN0cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTWFpbkN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL1RvZG8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3RvZG9zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBUb2RvQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvRXJyb3InLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL2Vycm9yLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBFcnJvckN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKCcvTWFpbicpO1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG59OyJdfQ==
