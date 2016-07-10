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

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

// dream
//import { AngularClient } from './client';

var moduleName = 'myApp';

window[moduleName] = angular.module(moduleName, ['ngResource', 'ngRoute' /*, 'angular-cache'*/]).config(_routes2.default).controller('MainCtrl', _Main2.default).controller('TodoCtrl', _Todo2.default).controller('ErrorCtrl', _Error2.default).directive('productList', _ProductList2.default);

window[moduleName].config(function () {
    window[moduleName].requires.push('angular-cache');
});

window[moduleName].config(function ($injector, $httpProvider, $cacheFactoryProvider) {

    var myInjector = angular.injector(['ng']);
    //console.log('myInjector = ', myInjector);

    var cacheFactory = $cacheFactoryProvider.$get;
    //console.log(cacheFactory);

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
            //console.log('Stating request', config);
            if (!config.cache) {
                config.cache = serverCache;
            }
            return config;
        }

        function requestError(rejection) {
            return $q.reject(rejection);
        }

        function response(response) {
            //console.log('getting response', response);

            if (typeof response.config.cache !== 'undefined') {
                var cache = response.config.cache;
                //console.log(cache.info());
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwic3JjL2NvbnRyb2xsZXJzL01haW4uanMiLCJzcmMvY29udHJvbGxlcnMvVG9kby5qcyIsInNyYy9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwic3JjL3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7QUFNQSxJQUFJLGFBQUosQUFBZTs7QUFFZixPQUFBLEFBQU8sY0FBYyxRQUFBLEFBQ0ksT0FESixBQUNXLFlBQVksQ0FBQSxBQUFDLGMsQUFEeEIsQUFDdUIsQUFBZSxrQ0FEdEMsQUFFSSx5QkFGSixBQUdJLFdBSEosQUFHZSw0QkFIZixBQUlJLFdBSkosQUFJZSw0QkFKZixBQUtJLFdBTEosQUFLZSw4QkFMZixBQU1JLFVBTkosQUFNYyw2QkFObkM7O0FBVUEsT0FBQSxBQUFPLFlBQVAsQUFBbUIsT0FBTyxZQUFXLEFBQ2pDO1dBQUEsQUFBTyxZQUFQLEFBQW1CLFNBQW5CLEFBQTRCLEtBRGhDLEFBQ0ksQUFBaUMsQUFDcEM7OztBQUdELE9BQUEsQUFBTyxZQUFQLEFBQW1CLE9BQU8sVUFBQSxBQUFVLFdBQVYsQUFBcUIsZUFBckIsQUFBb0MsdUJBQXVCLEFBR2pGOztRQUFJLGFBQWEsUUFBQSxBQUFRLFNBQVMsQ0FBbEMsQUFBaUIsQUFBaUIsQUFBQyxBQUduQzs7O1FBQUksZUFBZSxzQkFBbkIsQUFBeUMsQUFHekM7OztRQUFJLGNBQWMsYUFBbEIsQUFBa0IsQUFBYSxBQUUvQjs7UUFBSSxPQUFKLEFBQVcsQUFFWDs7UUFBSSxTQUFTLFNBQVQsQUFBUyxPQUFBLEFBQVMsS0FBdEIsQUFBMkIsQUFFMUIsQUFFRDs7YUFBQSxBQUFTLGNBQVQsQUFBd0IsSUFBSyxBQUN6Qjs7cUJBQU8sQUFDTSxB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LEVBQWdCO0FBQzNCLFdBQU87QUFDSCxrQkFBVSxHQURQO0FBRUgsaUJBQVMsSUFGTjtBQUdILG9CQUFZLEtBSFQ7QUFJSCxrQkFBVSx3SUFKUDtBQUtILGNBQU0sY0FBVSxLQUFWLEVBQWlCLE9BQWpCLEVBQTBCLEtBQTFCLEVBQWlDO0FBQ25DLGtCQUFNLE9BQU4sR0FBZ0IsSUFBaEI7QUFDQSxrQkFBTSxHQUFOLENBQVUsa0NBQVYsRUFBOEMsT0FBOUMsQ0FBc0QsVUFBVSxJQUFWLEVBQWdCO0FBQ2xFLHNCQUFNLFFBQU4sR0FBaUIsSUFBakI7QUFDQSxzQkFBTSxPQUFOLEdBQWdCLEtBQWhCO0FBQ0gsYUFIRDtBQUlIO0FBWEUsS0FBUDtBQWFILEM7O0FBQUE7Ozs7Ozs7OztrQkNMYyxVQUFTLGNBQVQsRUFBeUIsaUJBQXpCLEVBQTRDLFlBQTVDLEVBQTBEOztBQUdyRSxpQkFBYSxPQUFiLENBQXFCLEtBQXJCOztBQUVBLG1CQUFlLElBQWYsQ0FBb0IsT0FBcEIsRUFBNkI7QUFDekIscUJBQWEsdUJBRFk7QUFFekIsa0NBRnlCO0FBR3pCLHNCQUFjO0FBSFcsS0FBN0I7O0FBTUEsbUJBQWUsSUFBZixDQUFvQixPQUFwQixFQUE2QjtBQUN6QixxQkFBYSxvQkFEWTtBQUV6QixrQ0FGeUI7QUFHekIsc0JBQWM7QUFIVyxLQUE3Qjs7QUFNQSxtQkFBZSxJQUFmLENBQW9CLFFBQXBCLEVBQThCO0FBQzFCLHFCQUFhLG9CQURhO0FBRTFCLG1DQUYwQjtBQUcxQixzQkFBYztBQUhZLEtBQTlCOzs7O0FBUUEsbUJBQWUsU0FBZixDQUF5QixPQUF6Qjs7QUFFQSxzQkFBa0IsU0FBbEIsQ0FBNEIsSUFBNUI7QUFFSCxDOztBQW5DRDs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7OztBQWlDQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuaW1wb3J0IE1haW5DdHJsICBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsICBmcm9tICcuL2NvbnRyb2xsZXJzL1RvZG8nO1xuaW1wb3J0IFJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgUHJvZHVjdExpc3QgZnJvbSAnLi9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0JztcblxuLy8gZHJlYW1cbi8vaW1wb3J0IHsgQW5ndWxhckNsaWVudCB9IGZyb20gJy4vY2xpZW50JztcblxuXG52YXIgbW9kdWxlTmFtZT0nbXlBcHAnO1xuXG53aW5kb3dbbW9kdWxlTmFtZV0gPSBhbmd1bGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAubW9kdWxlKG1vZHVsZU5hbWUsIFsnbmdSZXNvdXJjZScsICduZ1JvdXRlJy8qLCAnYW5ndWxhci1jYWNoZScqL10pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uZmlnKFJvdXRlcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdNYWluQ3RybCcsIE1haW5DdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ1RvZG9DdHJsJywgVG9kb0N0cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignRXJyb3JDdHJsJywgRXJyb3JDdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRpcmVjdGl2ZSgncHJvZHVjdExpc3QnLFByb2R1Y3RMaXN0KTtcblxuXG5cbndpbmRvd1ttb2R1bGVOYW1lXS5jb25maWcoZnVuY3Rpb24oKSB7XG4gICAgd2luZG93W21vZHVsZU5hbWVdLnJlcXVpcmVzLnB1c2goJ2FuZ3VsYXItY2FjaGUnKTtcbn0pO1xuXG5cbndpbmRvd1ttb2R1bGVOYW1lXS5jb25maWcoZnVuY3Rpb24oICRpbmplY3RvciwgJGh0dHBQcm92aWRlciwgJGNhY2hlRmFjdG9yeVByb3ZpZGVyKSB7XG5cblxuICAgIHZhciBteUluamVjdG9yID0gYW5ndWxhci5pbmplY3RvcihbJ25nJ10pO1xuICAgIC8vY29uc29sZS5sb2coJ215SW5qZWN0b3IgPSAnLCBteUluamVjdG9yKTtcblxuICAgIHZhciBjYWNoZUZhY3RvcnkgPSAkY2FjaGVGYWN0b3J5UHJvdmlkZXIuJGdldDtcbiAgICAvL2NvbnNvbGUubG9nKGNhY2hlRmFjdG9yeSk7XG5cbiAgICB2YXIgc2VydmVyQ2FjaGUgPSBjYWNoZUZhY3RvcnkoJ3NlcnZlcicpO1xuXG4gICAgdmFyIGtleXMgPSB7fTtcblxuICAgIHZhciBhZGRLZXkgPSBmdW5jdGlvbihrZXkpIHtcblxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbnRlcmNlcHRIdHRwKCAkcSApIHtcbiAgICAgICAgcmV0dXJuKHtcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgICByZXF1ZXN0RXJyb3I6IHJlcXVlc3RFcnJvcixcbiAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IHJlc3BvbnNlRXJyb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCggY29uZmlnICkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnU3RhdGluZyByZXF1ZXN0JywgY29uZmlnKTtcbiAgICAgICAgICAgIGlmICghY29uZmlnLmNhY2hlKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmNhY2hlID0gc2VydmVyQ2FjaGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4oIGNvbmZpZyApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEVycm9yKCByZWplY3Rpb24gKSB7XG4gICAgICAgICAgICByZXR1cm4oICRxLnJlamVjdCggcmVqZWN0aW9uICkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlKCByZXNwb25zZSApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2dldHRpbmcgcmVzcG9uc2UnLCByZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UuY29uZmlnLmNhY2hlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciBjYWNoZSA9IHJlc3BvbnNlLmNvbmZpZy5jYWNoZTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNhY2hlLmluZm8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4oIHJlc3BvbnNlICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZXNwb25zZUVycm9yKCByZXNwb25zZSApIHtcbiAgICAgICAgICAgIHJldHVybiggJHEucmVqZWN0KCByZXNwb25zZSApICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCBpbnRlcmNlcHRIdHRwICk7XG59KTtcblxuLyoqIERyZWFtXG5cbmlmICggdHlwZW9mIHdpbmRvdy5vblNlcnZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBBbmd1bGFyQ2xpZW50KGFuZ3VsYXIsIGRvY3VtZW50LCAxMDApO1xufVxuICovXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiAxNy8wMi8xNi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JDdHJsIHtcblxuICAgIGNvbnN0cnVjdG9yKCRsb2cpIHtcblxuICAgICAgICBjb25zdCBlcnJvcjEgPSAnQ2F0Y2hhYmxlIEVycm9yKCknO1xuICAgICAgICBjb25zdCBlcnJvcjIgPSAnQ2F0Y2hhYmxlIEV4Y2VwdGlvbigpJztcbiAgICAgICAgY29uc3QgZXJyb3IzID0gJ1VuY2F0Y2hhYmxlIEVycm9yKCkgLSBzaG91bGQgY3Jhc2ggdGhlIGFwcC4nO1xuXG4gICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjEpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoZXJyb3IxKVxuICAgICAgICB9IGNhdGNoIChlMSkge1xuICAgICAgICAgICAgJGxvZy5sb2coJ0kgY2F0Y2hlZCBhbiBFcnJvci9FeGNlcHRpb246ICcgKyBlMSApO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXhjZXB0aW9uKGVycm9yMik7XG4gICAgICAgICAgICB9IGNhdGNoIChlMikge1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdJIGNhdGNoZWQgYW4gRXJyb3IvRXhjZXB0aW9uOiAnICsgZTIgKTtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXhjZXB0aW9uKGVycm9yMyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRocm93RXJyb3IgPSAodGV4dCkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfTtcblxuICAgIHRocm93RXhjZXB0aW9uID0gKHRleHQpID0+IHtcbiAgICAgICAgdGhyb3cgdGV4dDtcbiAgICB9O1xuXG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gOS8wMi8xNi5cbiAqL1xuXG5jbGFzcyBNYWluQ3RybCB7XG4gICAgY29uc3RydWN0b3IoJGxvZyl7XG5cbiAgICAgICAgJGxvZy5sb2coJ0kgYW0gYSBsb2cnLCAnd2l0aCB0d28gcGFyYW1ldGVycycpO1xuICAgICAgICAkbG9nLndhcm4oJ0kgYW0gYSB3YXJuJyk7XG4gICAgICAgICRsb2cuaW5mbygnSSBhbSBhbiBpbmZvJyk7XG4gICAgICAgIC8qJGxvZy5lcnJvcignSSBhbSBlcnJvciB3aXRoIGFuIG9iamVjdCcsIHtcbiAgICAgICAgICAgIG5hbWU6ICd2YWx1ZSdcbiAgICAgICAgfSk7Ki9cblxuXG4gICAgfVxuXG4gICAgdGl0bGUgPSAnQW5ndWxhciBFczYgcmV2aXNpdGVkJztcbn1cbmV4cG9ydCBkZWZhdWx0IE1haW5DdHJsOyIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9kb0N0cmwge1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1RvZG9DdHJsIExvYWRlZCcsIHRoaXMpO1xuICAgIH1cblxuICAgIGFkZFRvZG8gPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9kb3MucHVzaCh7dGV4dDp0aGlzLnRvZG9UZXh0LCBkb25lOmZhbHNlfSk7XG4gICAgICAgIHRoaXMudG9kb1RleHQgPSAnJztcbiAgICB9O1xuXG5cbiAgICB0aXRsZSA9IFwiVG9kb3MgdGl0bGVcIjtcblxuICAgIHRvZG9zID0gW1xuICAgICAgICB7dGV4dDonbGVhcm4gYW5ndWxhcicsIGRvbmU6dHJ1ZX0sXG4gICAgICAgIHt0ZXh0OididWlsZCBhbiBhbmd1bGFyIGFwcCcsIGRvbmU6ZmFsc2V9XTtcblxuICAgIHRvZG9UZXh0ID0gJyc7XG5cblxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdj48c3BhbiBuZy1zaG93PVwibG9hZGluZ1wiPmxvYWRpbmcgcHJvZHVjdHM8L3NwYW4+IDxsaSBuZy1yZXBlYXQ9XCJwcm9kdWN0IGluIHByb2R1Y3RzXCI+e3twcm9kdWN0Lm5hbWV9fSB7e3Byb2R1Y3QucHJpY2V9fTwvbGk+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2h0dHA6Ly9hcGkuZXhhbXBsZTo4MDgwL3Byb2R1Y3RzJykuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnByb2R1Y3RzID0gZGF0YTtcbiAgICAgICAgICAgICAgICBzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gOS8wMi8xNi5cbiAqL1xuaW1wb3J0IE1haW5DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvTWFpbic7XG5pbXBvcnQgVG9kb0N0cmwgZnJvbSAnLi9jb250cm9sbGVycy9Ub2RvJztcbmltcG9ydCBFcnJvckN0cmwgZnJvbSAnLi9jb250cm9sbGVycy9FcnJvcic7XG5cbi8vaW1wb3J0IHtJbmplY3RTZXJ2ZXJ9IGZyb20gJy4uL2FuZ3VsYXIvc2VydmVyJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkc2NlUHJvdmlkZXIpIHtcblxuXG4gICAgJHNjZVByb3ZpZGVyLmVuYWJsZWQoZmFsc2UpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL01haW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9wcm9kdWN0cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTWFpbkN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL1RvZG8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy90b2Rvcy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogVG9kb0N0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL0Vycm9yJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvZXJyb3IuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IEVycm9yQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAvLyRsb2NhdGlvblByb3ZpZGVyLmhhc2hQcmVmaXgoJyEhIScpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKCcvTWFpbicpO1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG59OyJdfQ==
