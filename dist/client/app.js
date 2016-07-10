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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// dream
//import { AngularClient } from './client';

var moduleName = 'myApp';

window[moduleName] = angular.module(moduleName, ['ngResource', 'ngRoute' /*, 'angular-cache'*/]).config(_routes2.default).controller('MainCtrl', _Main2.default).controller('TodoCtrl', _Todo2.default).controller('ErrorCtrl', _Error2.default).directive('productList', _ProductList2.default);

window[moduleName].config(function () {
    window[moduleName].requires.push('angular-cache');
});

window[moduleName].config(function ($injector, $httpProvider, $cacheFactoryProvider) {

    var myInjector = angular.injector(['ng']);
    console.log('myInjector = ', myInjector);

    var cacheFactory = $cacheFactoryProvider.$get;
    console.log(cacheFactory);

    var serverCache = cacheFactory('server');

    var keys = {};

    var addKey = function addKey(key) {};

    function interceptHttp($q) {
        return {
            request: request,
            requestError: requestError,
            response: response,
            responseError: responseError
        };

        function request(config) {
            console.log('Stating request', config);
            if (!config.cache) {
                config.cache = serverCache;
            }
            return config;
        }

        function requestError(rejection) {
            return $q.reject(rejection);
        }

        function response(response) {
            console.log('getting response', response);

            if (typeof response.config.cache !== 'undefined') {
                var cache = response.config.cache;
                console.log(cache.info());
            }
            return response;
        }

        function responseError(response) {
            return $q.reject(response);
        }
    }

    $httpProvider.interceptors.push(interceptHttp);
});

/** Dream

if ( typeof window.onServer === 'undefined') {
    AngularClient(angular, document, 100);
}
 */

},{"./controllers/Error":2,"./controllers/Main":3,"./controllers/Todo":4,"./directives/ProductList":5,"./routes":6}],2:[function(require,module,exports){
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

exports.default = function ($routeProvider, $locationProvider, $sceProvider) {

    $sceProvider.enabled(false);

    $routeProvider.when('/Main', {
        templateUrl: './views/products.html',
        controller: _Main2.default,
        controllerAs: 'vm'
    });

    $routeProvider.when('/Todo', {
        templateUrl: './views/todos.html',
        controller: _Todo2.default,
        controllerAs: 'vm'
    });

    $routeProvider.when('/Error', {
        templateUrl: './views/error.html',
        controller: _Error2.default,
        controllerAs: 'vm'
    });

    //$locationProvider.hashPrefix('!!!');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwic3JjL2NvbnRyb2xsZXJzL01haW4uanMiLCJzcmMvY29udHJvbGxlcnMvVG9kby5qcyIsInNyYy9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwic3JjL3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7O0FBTUEsSUFBSSxhQUFXLE9BQWY7O0FBRUEsT0FBTyxVQUFQLElBQXFCLFFBQ0ksTUFESixDQUNXLFVBRFgsRUFDdUIsQ0FBQyxZQUFELEVBQWUsUyxzQkFBZixDQUR2QixFQUVJLE1BRkosbUJBR0ksVUFISixDQUdlLFVBSGYsa0JBSUksVUFKSixDQUllLFVBSmYsa0JBS0ksVUFMSixDQUtlLFdBTGYsbUJBTUksU0FOSixDQU1jLGFBTmQsd0JBQXJCOztBQVVBLE9BQU8sVUFBUCxFQUFtQixNQUFuQixDQUEwQixZQUFXO0FBQ2pDLFdBQU8sVUFBUCxFQUFtQixRQUFuQixDQUE0QixJQUE1QixDQUFpQyxlQUFqQztBQUNILENBRkQ7O0FBS0EsT0FBTyxVQUFQLEVBQW1CLE1BQW5CLENBQTBCLFVBQVUsU0FBVixFQUFxQixhQUFyQixFQUFvQyxxQkFBcEMsRUFBMkQ7O0FBR2pGLFFBQUksYUFBYSxRQUFRLFFBQVIsQ0FBaUIsQ0FBQyxJQUFELENBQWpCLENBQWpCO0FBQ0EsWUFBUSxHQUFSLENBQVksZUFBWixFQUE2QixVQUE3Qjs7QUFFQSxRQUFJLGVBQWUsc0JBQXNCLElBQXpDO0FBQ0EsWUFBUSxHQUFSLENBQVksWUFBWjs7QUFFQSxRQUFJLGNBQWMsYUFBYSxRQUFiLENBQWxCOztBQUVBLFFBQUksT0FBTyxFQUFYOztBQUVBLFFBQUksU0FBUyxTQUFULE1BQVMsQ0FBUyxHQUFULEVBQWMsQ0FFMUIs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QUFFSCxDOztBQW5DRDs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7OztBQWlDQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuaW1wb3J0IE1haW5DdHJsICBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsICBmcm9tICcuL2NvbnRyb2xsZXJzL1RvZG8nO1xuaW1wb3J0IFJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgUHJvZHVjdExpc3QgZnJvbSAnLi9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0JztcblxuLy8gZHJlYW1cbi8vaW1wb3J0IHsgQW5ndWxhckNsaWVudCB9IGZyb20gJy4vY2xpZW50JztcblxuXG52YXIgbW9kdWxlTmFtZT0nbXlBcHAnO1xuXG53aW5kb3dbbW9kdWxlTmFtZV0gPSBhbmd1bGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAubW9kdWxlKG1vZHVsZU5hbWUsIFsnbmdSZXNvdXJjZScsICduZ1JvdXRlJy8qLCAnYW5ndWxhci1jYWNoZScqL10pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uZmlnKFJvdXRlcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdNYWluQ3RybCcsIE1haW5DdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ1RvZG9DdHJsJywgVG9kb0N0cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignRXJyb3JDdHJsJywgRXJyb3JDdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRpcmVjdGl2ZSgncHJvZHVjdExpc3QnLFByb2R1Y3RMaXN0KTtcblxuXG5cbndpbmRvd1ttb2R1bGVOYW1lXS5jb25maWcoZnVuY3Rpb24oKSB7XG4gICAgd2luZG93W21vZHVsZU5hbWVdLnJlcXVpcmVzLnB1c2goJ2FuZ3VsYXItY2FjaGUnKTtcbn0pO1xuXG5cbndpbmRvd1ttb2R1bGVOYW1lXS5jb25maWcoZnVuY3Rpb24oICRpbmplY3RvciwgJGh0dHBQcm92aWRlciwgJGNhY2hlRmFjdG9yeVByb3ZpZGVyKSB7XG5cblxuICAgIHZhciBteUluamVjdG9yID0gYW5ndWxhci5pbmplY3RvcihbJ25nJ10pO1xuICAgIGNvbnNvbGUubG9nKCdteUluamVjdG9yID0gJywgbXlJbmplY3Rvcik7XG5cbiAgICB2YXIgY2FjaGVGYWN0b3J5ID0gJGNhY2hlRmFjdG9yeVByb3ZpZGVyLiRnZXQ7XG4gICAgY29uc29sZS5sb2coY2FjaGVGYWN0b3J5KTtcblxuICAgIHZhciBzZXJ2ZXJDYWNoZSA9IGNhY2hlRmFjdG9yeSgnc2VydmVyJyk7XG5cbiAgICB2YXIga2V5cyA9IHt9O1xuXG4gICAgdmFyIGFkZEtleSA9IGZ1bmN0aW9uKGtleSkge1xuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGludGVyY2VwdEh0dHAoICRxICkge1xuICAgICAgICByZXR1cm4oe1xuICAgICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgICAgIHJlcXVlc3RFcnJvcjogcmVxdWVzdEVycm9yLFxuICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogcmVzcG9uc2VFcnJvclxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0KCBjb25maWcgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU3RhdGluZyByZXF1ZXN0JywgY29uZmlnKTtcbiAgICAgICAgICAgIGlmICghY29uZmlnLmNhY2hlKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmNhY2hlID0gc2VydmVyQ2FjaGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4oIGNvbmZpZyApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEVycm9yKCByZWplY3Rpb24gKSB7XG4gICAgICAgICAgICByZXR1cm4oICRxLnJlamVjdCggcmVqZWN0aW9uICkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlKCByZXNwb25zZSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXR0aW5nIHJlc3BvbnNlJywgcmVzcG9uc2UpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlLmNvbmZpZy5jYWNoZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FjaGUgPSByZXNwb25zZS5jb25maWcuY2FjaGU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2FjaGUuaW5mbygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiggcmVzcG9uc2UgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlRXJyb3IoIHJlc3BvbnNlICkge1xuICAgICAgICAgICAgcmV0dXJuKCAkcS5yZWplY3QoIHJlc3BvbnNlICkgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goIGludGVyY2VwdEh0dHAgKTtcbn0pO1xuXG4vKiogRHJlYW1cblxuaWYgKCB0eXBlb2Ygd2luZG93Lm9uU2VydmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIEFuZ3VsYXJDbGllbnQoYW5ndWxhciwgZG9jdW1lbnQsIDEwMCk7XG59XG4gKi9cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDE3LzAyLzE2LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvckN0cmwge1xuXG4gICAgY29uc3RydWN0b3IoJGxvZykge1xuXG4gICAgICAgIGNvbnN0IGVycm9yMSA9ICdDYXRjaGFibGUgRXJyb3IoKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMiA9ICdDYXRjaGFibGUgRXhjZXB0aW9uKCknO1xuICAgICAgICBjb25zdCBlcnJvcjMgPSAnVW5jYXRjaGFibGUgRXJyb3IoKSAtIHNob3VsZCBjcmFzaCB0aGUgYXBwLic7XG5cbiAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcihlcnJvcjEpXG4gICAgICAgIH0gY2F0Y2ggKGUxKSB7XG4gICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUxICk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjIpO1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFeGNlcHRpb24oZXJyb3IyKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ0kgY2F0Y2hlZCBhbiBFcnJvci9FeGNlcHRpb246ICcgKyBlMiApO1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjMpO1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFeGNlcHRpb24oZXJyb3IzKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3dFcnJvciA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9O1xuXG4gICAgdGhyb3dFeGNlcHRpb24gPSAodGV4dCkgPT4ge1xuICAgICAgICB0aHJvdyB0ZXh0O1xuICAgIH07XG5cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmNsYXNzIE1haW5DdHJsIHtcbiAgICBjb25zdHJ1Y3RvcigkbG9nKXtcblxuICAgICAgICAkbG9nLmxvZygnSSBhbSBhIGxvZycsICd3aXRoIHR3byBwYXJhbWV0ZXJzJyk7XG4gICAgICAgICRsb2cud2FybignSSBhbSBhIHdhcm4nKTtcbiAgICAgICAgJGxvZy5pbmZvKCdJIGFtIGFuIGluZm8nKTtcbiAgICAgICAgLyokbG9nLmVycm9yKCdJIGFtIGVycm9yIHdpdGggYW4gb2JqZWN0Jywge1xuICAgICAgICAgICAgbmFtZTogJ3ZhbHVlJ1xuICAgICAgICB9KTsqL1xuXG5cbiAgICB9XG5cbiAgICB0aXRsZSA9ICdBbmd1bGFyIEVzNiByZXZpc2l0ZWQnO1xufVxuZXhwb3J0IGRlZmF1bHQgTWFpbkN0cmw7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gOS8wMi8xNi5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2RvQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBjb25zb2xlLmxvZygnVG9kb0N0cmwgTG9hZGVkJywgdGhpcyk7XG4gICAgfVxuXG4gICAgYWRkVG9kbyA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50b2Rvcy5wdXNoKHt0ZXh0OnRoaXMudG9kb1RleHQsIGRvbmU6ZmFsc2V9KTtcbiAgICAgICAgdGhpcy50b2RvVGV4dCA9ICcnO1xuICAgIH07XG5cblxuICAgIHRpdGxlID0gXCJUb2RvcyB0aXRsZVwiO1xuXG4gICAgdG9kb3MgPSBbXG4gICAgICAgIHt0ZXh0OidsZWFybiBhbmd1bGFyJywgZG9uZTp0cnVlfSxcbiAgICAgICAge3RleHQ6J2J1aWxkIGFuIGFuZ3VsYXIgYXBwJywgZG9uZTpmYWxzZX1dO1xuXG4gICAgdG9kb1RleHQgPSAnJztcblxuXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oJGh0dHApIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiBmYWxzZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2PjxzcGFuIG5nLXNob3c9XCJsb2FkaW5nXCI+bG9hZGluZyBwcm9kdWN0czwvc3Bhbj4gPGxpIG5nLXJlcGVhdD1cInByb2R1Y3QgaW4gcHJvZHVjdHNcIj57e3Byb2R1Y3QubmFtZX19IHt7cHJvZHVjdC5wcmljZX19PC9saT48L2Rpdj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICRodHRwLmdldCgnaHR0cDovL2FwaS5leGFtcGxlOjgwODAvcHJvZHVjdHMnKS5zdWNjZXNzKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucHJvZHVjdHMgPSBkYXRhO1xuICAgICAgICAgICAgICAgIHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5pbXBvcnQgTWFpbkN0cmwgZnJvbSAnLi9jb250cm9sbGVycy9NYWluJztcbmltcG9ydCBUb2RvQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL1RvZG8nO1xuaW1wb3J0IEVycm9yQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL0Vycm9yJztcblxuLy9pbXBvcnQge0luamVjdFNlcnZlcn0gZnJvbSAnLi4vYW5ndWxhci9zZXJ2ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRzY2VQcm92aWRlcikge1xuXG5cbiAgICAkc2NlUHJvdmlkZXIuZW5hYmxlZChmYWxzZSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvTWFpbicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL3Byb2R1Y3RzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBNYWluQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvVG9kbycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL3RvZG9zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBUb2RvQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvRXJyb3InLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9lcnJvci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogRXJyb3JDdHJsLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICB9KTtcblxuICAgIC8vJGxvY2F0aW9uUHJvdmlkZXIuaGFzaFByZWZpeCgnISEhJyk7XG5cbiAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2UoJy9NYWluJyk7XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG5cbn07Il19
