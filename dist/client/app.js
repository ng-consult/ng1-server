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

window[moduleName] = angular.module(moduleName, ['ngResource', 'ngRoute']).config(_routes2.default).controller('MainCtrl', _Main2.default).controller('TodoCtrl', _Todo2.default).controller('ErrorCtrl', _Error2.default).directive('productList', _ProductList2.default);

console.log('Angular = ', window[moduleName]);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwic3JjL2NvbnRyb2xsZXJzL01haW4uanMiLCJzcmMvY29udHJvbGxlcnMvVG9kby5qcyIsInNyYy9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwic3JjL3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7O0FBTUEsSUFBSSxhQUFXLE9BQWY7O0FBRUEsT0FBTyxVQUFQLElBQXFCLFFBQ0ksTUFESixDQUNXLFVBRFgsRUFDdUIsQ0FBQyxZQUFELEVBQWUsU0FBZixDQUR2QixFQUVJLE1BRkosbUJBR0ksVUFISixDQUdlLFVBSGYsa0JBSUksVUFKSixDQUllLFVBSmYsa0JBS0ksVUFMSixDQUtlLFdBTGYsbUJBTUksU0FOSixDQU1jLGFBTmQsd0JBQXJCOztBQVFBLFFBQVEsR0FBUixDQUFZLFlBQVosRUFBMEIsT0FBTyxVQUFQLENBQTFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNqQnFCLFMsR0FFakIsbUJBQVksSUFBWixFQUFrQjtBQUFBOztBQUFBLFNBd0JsQixVQXhCa0IsR0F3QkwsVUFBQyxJQUFELEVBQVU7QUFDbkIsY0FBTSxJQUFJLEtBQUosQ0FBVSxJQUFWLENBQU47QUFDSCxLQTFCaUI7O0FBQUEsU0E0QmxCLGNBNUJrQixHQTRCRCxVQUFDLElBQUQsRUFBVTtBQUN2QixjQUFNLElBQU47QUFDSCxLQTlCaUI7O0FBRWQsUUFBTSxTQUFTLG1CQUFmO0FBQ0EsUUFBTSxTQUFTLHVCQUFmO0FBQ0EsUUFBTSxTQUFTLDZDQUFmOztBQUVBLFNBQUssR0FBTCxDQUFTLGFBQWEsTUFBdEI7O0FBRUEsUUFBSTtBQUNBLGFBQUssVUFBTCxDQUFnQixNQUFoQjtBQUNILEtBRkQsQ0FFRSxPQUFPLEVBQVAsRUFBVztBQUNULGFBQUssR0FBTCxDQUFTLG1DQUFtQyxFQUE1QztBQUNBLFlBQUk7QUFDQSxpQkFBSyxHQUFMLENBQVMsYUFBYSxNQUF0QjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsTUFBcEI7QUFDSCxTQUhELENBR0UsT0FBTyxFQUFQLEVBQVc7QUFDVCxpQkFBSyxHQUFMLENBQVMsbUNBQW1DLEVBQTVDO0FBQ0EsaUJBQUssR0FBTCxDQUFTLGFBQWEsTUFBdEI7QUFDQSxpQkFBSyxjQUFMLENBQW9CLE1BQXBCO0FBRUg7QUFDSjtBQUNKLEM7O2tCQXhCZ0IsUzs7Ozs7Ozs7Ozs7Ozs7O0lDQ2YsUSxHQUNGLGtCQUFZLElBQVosRUFBaUI7QUFBQTs7QUFBQSxTQVlqQixLQVppQixHQVlULHVCQVpTOzs7QUFFYixTQUFLLEdBQUwsQ0FBUyxZQUFULEVBQXVCLHFCQUF2QjtBQUNBLFNBQUssSUFBTCxDQUFVLGFBQVY7QUFDQSxTQUFLLElBQUwsQ0FBVSxjQUFWOzs7O0FBTUgsQzs7a0JBSVUsUTs7Ozs7Ozs7Ozs7Ozs7O0lDZk0sUSxHQUVqQixvQkFBYTtBQUFBOztBQUFBOztBQUFBLFNBSWIsT0FKYSxHQUlILFlBQU07QUFDWixjQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEVBQUMsTUFBSyxNQUFLLFFBQVgsRUFBcUIsTUFBSyxLQUExQixFQUFoQjtBQUNBLGNBQUssUUFBTCxHQUFnQixFQUFoQjtBQUNILEtBUFk7O0FBQUEsU0FVYixLQVZhLEdBVUwsYUFWSztBQUFBLFNBWWIsS0FaYSxHQVlMLENBQ0osRUFBQyxNQUFLLGVBQU4sRUFBdUIsTUFBSyxJQUE1QixFQURJLEVBRUosRUFBQyxNQUFLLHNCQUFOLEVBQThCLE1BQUssS0FBbkMsRUFGSSxDQVpLO0FBQUEsU0FnQmIsUUFoQmEsR0FnQkYsRUFoQkU7O0FBQ1QsWUFBUSxHQUFSLENBQVksaUJBQVosRUFBK0IsSUFBL0I7QUFDSCxDOztrQkFKZ0IsUTs7Ozs7Ozs7O2tCQ0pOLFVBQVMsS0FBVCxFQUFnQjtBQUMzQixXQUFPO0FBQ0gsa0JBQVUsR0FEUDtBQUVILGlCQUFTLElBRk47QUFHSCxvQkFBWSxLQUhUO0FBSUgsa0JBQVUsd0lBSlA7QUFLSCxjQUFNLGNBQVUsS0FBVixFQUFpQixPQUFqQixFQUEwQixLQUExQixFQUFpQztBQUNuQyxrQkFBTSxPQUFOLEdBQWdCLElBQWhCO0FBQ0Esa0JBQU0sR0FBTixDQUFVLGtDQUFWLEVBQThDLE9BQTlDLENBQXNELFVBQVUsSUFBVixFQUFnQjtBQUNsRSxzQkFBTSxRQUFOLEdBQWlCLElBQWpCO0FBQ0Esc0JBQU0sT0FBTixHQUFnQixLQUFoQjtBQUNILGFBSEQ7QUFJSDtBQVhFLEtBQVA7QUFhSCxDOztBQUFBOzs7Ozs7Ozs7a0JDTGMsVUFBUyxjQUFULEVBQXlCLGlCQUF6QixFQUE0QyxZQUE1QyxFQUEwRDs7QUFHckUsaUJBQWEsT0FBYixDQUFxQixLQUFyQjs7QUFFQSxtQkFBZSxJQUFmLENBQW9CLE9BQXBCLEVBQTZCO0FBQ3pCLHFCQUFhLHVCQURZO0FBRXpCLGtDQUZ5QjtBQUd6QixzQkFBYztBQUhXLEtBQTdCOztBQU1BLG1CQUFlLElBQWYsQ0FBb0IsT0FBcEIsRUFBNkI7QUFDekIscUJBQWEsb0JBRFk7QUFFekIsa0NBRnlCO0FBR3pCLHNCQUFjO0FBSFcsS0FBN0I7O0FBTUEsbUJBQWUsSUFBZixDQUFvQixRQUFwQixFQUE4QjtBQUMxQixxQkFBYSxvQkFEYTtBQUUxQixtQ0FGMEI7QUFHMUIsc0JBQWM7QUFIWSxLQUE5Qjs7OztBQVFBLG1CQUFlLFNBQWYsQ0FBeUIsT0FBekI7O0FBRUEsc0JBQWtCLFNBQWxCLENBQTRCLElBQTVCO0FBRUgsQzs7QUFuQ0Q7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUFpQ0MiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEVycm9yQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL0Vycm9yJztcbmltcG9ydCBNYWluQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9NYWluJztcbmltcG9ydCBUb2RvQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9Ub2RvJztcbmltcG9ydCBSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IFByb2R1Y3RMaXN0IGZyb20gJy4vZGlyZWN0aXZlcy9Qcm9kdWN0TGlzdCc7XG5cbi8vIGRyZWFtXG4vL2ltcG9ydCB7IEFuZ3VsYXJDbGllbnQgfSBmcm9tICcuL2NsaWVudCc7XG5cblxudmFyIG1vZHVsZU5hbWU9J215QXBwJztcblxud2luZG93W21vZHVsZU5hbWVdID0gYW5ndWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1vZHVsZShtb2R1bGVOYW1lLCBbJ25nUmVzb3VyY2UnLCAnbmdSb3V0ZSddKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmZpZyhSb3V0ZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignTWFpbkN0cmwnLCBNYWluQ3RybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdUb2RvQ3RybCcsIFRvZG9DdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ0Vycm9yQ3RybCcsIEVycm9yQ3RybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kaXJlY3RpdmUoJ3Byb2R1Y3RMaXN0JyxQcm9kdWN0TGlzdCk7XG5cbmNvbnNvbGUubG9nKCdBbmd1bGFyID0gJywgd2luZG93W21vZHVsZU5hbWVdKTtcblxuLypcblxuXG53aW5kb3dbbW9kdWxlTmFtZV0uY29uZmlnKGZ1bmN0aW9uKCAkaW5qZWN0b3IsICRodHRwUHJvdmlkZXIsICRjYWNoZUZhY3RvcnlQcm92aWRlcikge1xuXG5cbiAgICB2YXIgbXlJbmplY3RvciA9IGFuZ3VsYXIuaW5qZWN0b3IoWyduZyddKTtcbiAgICAvL2NvbnNvbGUubG9nKCdteUluamVjdG9yID0gJywgbXlJbmplY3Rvcik7XG5cbiAgICB2YXIgY2FjaGVGYWN0b3J5ID0gJGNhY2hlRmFjdG9yeVByb3ZpZGVyLiRnZXQ7XG4gICAgLy9jb25zb2xlLmxvZyhjYWNoZUZhY3RvcnkpO1xuXG4gICAgdmFyIHNlcnZlckNhY2hlID0gY2FjaGVGYWN0b3J5KCdzZXJ2ZXInKTtcblxuICAgIHZhciBrZXlzID0ge307XG5cbiAgICB2YXIgYWRkS2V5ID0gZnVuY3Rpb24oa2V5KSB7XG5cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaW50ZXJjZXB0SHR0cCggJHEgKSB7XG4gICAgICAgIHJldHVybih7XG4gICAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxuICAgICAgICAgICAgcmVxdWVzdEVycm9yOiByZXF1ZXN0RXJyb3IsXG4gICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiByZXNwb25zZUVycm9yXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3QoIGNvbmZpZyApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1N0YXRpbmcgcmVxdWVzdCcsIGNvbmZpZyk7XG4gICAgICAgICAgICBpZiAoIWNvbmZpZy5jYWNoZSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5jYWNoZSA9IHNlcnZlckNhY2hlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuKCBjb25maWcgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3RFcnJvciggcmVqZWN0aW9uICkge1xuICAgICAgICAgICAgcmV0dXJuKCAkcS5yZWplY3QoIHJlamVjdGlvbiApICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZXNwb25zZSggcmVzcG9uc2UgKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdnZXR0aW5nIHJlc3BvbnNlJywgcmVzcG9uc2UpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlLmNvbmZpZy5jYWNoZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FjaGUgPSByZXNwb25zZS5jb25maWcuY2FjaGU7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjYWNoZS5pbmZvKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuKCByZXNwb25zZSApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzcG9uc2VFcnJvciggcmVzcG9uc2UgKSB7XG4gICAgICAgICAgICByZXR1cm4oICRxLnJlamVjdCggcmVzcG9uc2UgKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaCggaW50ZXJjZXB0SHR0cCApO1xufSk7XG5cbiovXG4vKiogRHJlYW1cblxuaWYgKCB0eXBlb2Ygd2luZG93Lm9uU2VydmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIEFuZ3VsYXJDbGllbnQoYW5ndWxhciwgZG9jdW1lbnQsIDEwMCk7XG59XG4gKi9cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDE3LzAyLzE2LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvckN0cmwge1xuXG4gICAgY29uc3RydWN0b3IoJGxvZykge1xuXG4gICAgICAgIGNvbnN0IGVycm9yMSA9ICdDYXRjaGFibGUgRXJyb3IoKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMiA9ICdDYXRjaGFibGUgRXhjZXB0aW9uKCknO1xuICAgICAgICBjb25zdCBlcnJvcjMgPSAnVW5jYXRjaGFibGUgRXJyb3IoKSAtIHNob3VsZCBjcmFzaCB0aGUgYXBwLic7XG5cbiAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcihlcnJvcjEpXG4gICAgICAgIH0gY2F0Y2ggKGUxKSB7XG4gICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUxICk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjIpO1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFeGNlcHRpb24oZXJyb3IyKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ0kgY2F0Y2hlZCBhbiBFcnJvci9FeGNlcHRpb246ICcgKyBlMiApO1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjMpO1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFeGNlcHRpb24oZXJyb3IzKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3dFcnJvciA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9O1xuXG4gICAgdGhyb3dFeGNlcHRpb24gPSAodGV4dCkgPT4ge1xuICAgICAgICB0aHJvdyB0ZXh0O1xuICAgIH07XG5cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmNsYXNzIE1haW5DdHJsIHtcbiAgICBjb25zdHJ1Y3RvcigkbG9nKXtcblxuICAgICAgICAkbG9nLmxvZygnSSBhbSBhIGxvZycsICd3aXRoIHR3byBwYXJhbWV0ZXJzJyk7XG4gICAgICAgICRsb2cud2FybignSSBhbSBhIHdhcm4nKTtcbiAgICAgICAgJGxvZy5pbmZvKCdJIGFtIGFuIGluZm8nKTtcbiAgICAgICAgLyokbG9nLmVycm9yKCdJIGFtIGVycm9yIHdpdGggYW4gb2JqZWN0Jywge1xuICAgICAgICAgICAgbmFtZTogJ3ZhbHVlJ1xuICAgICAgICB9KTsqL1xuXG5cbiAgICB9XG5cbiAgICB0aXRsZSA9ICdBbmd1bGFyIEVzNiByZXZpc2l0ZWQnO1xufVxuZXhwb3J0IGRlZmF1bHQgTWFpbkN0cmw7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gOS8wMi8xNi5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2RvQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBjb25zb2xlLmxvZygnVG9kb0N0cmwgTG9hZGVkJywgdGhpcyk7XG4gICAgfVxuXG4gICAgYWRkVG9kbyA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50b2Rvcy5wdXNoKHt0ZXh0OnRoaXMudG9kb1RleHQsIGRvbmU6ZmFsc2V9KTtcbiAgICAgICAgdGhpcy50b2RvVGV4dCA9ICcnO1xuICAgIH07XG5cblxuICAgIHRpdGxlID0gXCJUb2RvcyB0aXRsZVwiO1xuXG4gICAgdG9kb3MgPSBbXG4gICAgICAgIHt0ZXh0OidsZWFybiBhbmd1bGFyJywgZG9uZTp0cnVlfSxcbiAgICAgICAge3RleHQ6J2J1aWxkIGFuIGFuZ3VsYXIgYXBwJywgZG9uZTpmYWxzZX1dO1xuXG4gICAgdG9kb1RleHQgPSAnJztcblxuXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oJGh0dHApIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiBmYWxzZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2PjxzcGFuIG5nLXNob3c9XCJsb2FkaW5nXCI+bG9hZGluZyBwcm9kdWN0czwvc3Bhbj4gPGxpIG5nLXJlcGVhdD1cInByb2R1Y3QgaW4gcHJvZHVjdHNcIj57e3Byb2R1Y3QubmFtZX19IHt7cHJvZHVjdC5wcmljZX19PC9saT48L2Rpdj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICBzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICRodHRwLmdldCgnaHR0cDovL2FwaS5leGFtcGxlOjgwODAvcHJvZHVjdHMnKS5zdWNjZXNzKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucHJvZHVjdHMgPSBkYXRhO1xuICAgICAgICAgICAgICAgIHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5pbXBvcnQgTWFpbkN0cmwgZnJvbSAnLi9jb250cm9sbGVycy9NYWluJztcbmltcG9ydCBUb2RvQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL1RvZG8nO1xuaW1wb3J0IEVycm9yQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL0Vycm9yJztcblxuLy9pbXBvcnQge0luamVjdFNlcnZlcn0gZnJvbSAnLi4vYW5ndWxhci9zZXJ2ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRzY2VQcm92aWRlcikge1xuXG5cbiAgICAkc2NlUHJvdmlkZXIuZW5hYmxlZChmYWxzZSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvTWFpbicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL3Byb2R1Y3RzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBNYWluQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvVG9kbycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL3RvZG9zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBUb2RvQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvRXJyb3InLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9lcnJvci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogRXJyb3JDdHJsLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICB9KTtcblxuICAgIC8vJGxvY2F0aW9uUHJvdmlkZXIuaGFzaFByZWZpeCgnISEhJyk7XG5cbiAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2UoJy9NYWluJyk7XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG5cbn07Il19
