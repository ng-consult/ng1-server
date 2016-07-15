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

console.log('URL = ', window.location.href);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXBwLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL01haW4uanMiLCJjbGllbnQvY29udHJvbGxlcnMvVG9kby5qcyIsImNsaWVudC9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwiY2xpZW50L3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7O0FBTUEsSUFBSSxhQUFXLE9BQWY7O0FBRUEsT0FBTyxVQUFQLElBQXFCLFFBQ0ksTUFESixDQUNXLFVBRFgsRUFDdUIsQ0FBQyxZQUFELEVBQWUsU0FBZixDQUR2QixFQUVJLE1BRkosbUJBR0ksVUFISixDQUdlLFVBSGYsa0JBSUksVUFKSixDQUllLFVBSmYsa0JBS0ksVUFMSixDQUtlLFdBTGYsbUJBTUksU0FOSixDQU1jLGFBTmQsd0JBQXJCOztBQVFBLFFBQVEsR0FBUixDQUFZLFFBQVosRUFBc0IsT0FBTyxRQUFQLENBQWdCLElBQXRDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ2pCcUIsUyxHQUVqQixtQkFBWSxJQUFaLEVBQWtCO0FBQUE7O0FBQUEsU0F3QmxCLFVBeEJrQixHQXdCTCxVQUFDLElBQUQsRUFBVTtBQUNuQixjQUFNLElBQUksS0FBSixDQUFVLElBQVYsQ0FBTjtBQUNILEtBMUJpQjs7QUFBQSxTQTRCbEIsY0E1QmtCLEdBNEJELFVBQUMsSUFBRCxFQUFVO0FBQ3ZCLGNBQU0sSUFBTjtBQUNILEtBOUJpQjs7QUFFZCxRQUFNLFNBQVMsbUJBQWY7QUFDQSxRQUFNLFNBQVMsdUJBQWY7QUFDQSxRQUFNLFNBQVMsNkNBQWY7O0FBRUEsU0FBSyxHQUFMLENBQVMsYUFBYSxNQUF0Qjs7QUFFQSxRQUFJO0FBQ0EsYUFBSyxVQUFMLENBQWdCLE1BQWhCO0FBQ0gsS0FGRCxDQUVFLE9BQU8sRUFBUCxFQUFXO0FBQ1QsYUFBSyxHQUFMLENBQVMsbUNBQW1DLEVBQTVDO0FBQ0EsWUFBSTtBQUNBLGlCQUFLLEdBQUwsQ0FBUyxhQUFhLE1BQXRCO0FBQ0EsaUJBQUssY0FBTCxDQUFvQixNQUFwQjtBQUNILFNBSEQsQ0FHRSxPQUFPLEVBQVAsRUFBVztBQUNULGlCQUFLLEdBQUwsQ0FBUyxtQ0FBbUMsRUFBNUM7QUFDQSxpQkFBSyxHQUFMLENBQVMsYUFBYSxNQUF0QjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsTUFBcEI7QUFFSDtBQUNKO0FBQ0osQzs7a0JBeEJnQixTOzs7Ozs7Ozs7Ozs7Ozs7SUNDZixRLEdBQ0Ysa0JBQVksSUFBWixFQUFpQjtBQUFBOztBQUFBLFNBWWpCLEtBWmlCLEdBWVQsdUJBWlM7OztBQUViLFNBQUssR0FBTCxDQUFTLFlBQVQsRUFBdUIscUJBQXZCO0FBQ0EsU0FBSyxJQUFMLENBQVUsYUFBVjtBQUNBLFNBQUssSUFBTCxDQUFVLGNBQVY7Ozs7QUFNSCxDOztrQkFJVSxROzs7Ozs7Ozs7Ozs7Ozs7SUNmTSxRLEdBRWpCLG9CQUFhO0FBQUE7O0FBQUE7O0FBQUEsU0FJYixPQUphLEdBSUgsWUFBTTtBQUNaLGNBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsRUFBQyxNQUFLLE1BQUssUUFBWCxFQUFxQixNQUFLLEtBQTFCLEVBQWhCO0FBQ0EsY0FBSyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0gsS0FQWTs7QUFBQSxTQVViLEtBVmEsR0FVTCxhQVZLO0FBQUEsU0FZYixLQVphLEdBWUwsQ0FDSixFQUFDLE1BQUssZUFBTixFQUF1QixNQUFLLElBQTVCLEVBREksRUFFSixFQUFDLE1BQUssc0JBQU4sRUFBOEIsTUFBSyxLQUFuQyxFQUZJLENBWks7QUFBQSxTQWdCYixRQWhCYSxHQWdCRixFQWhCRTs7QUFDVCxZQUFRLEdBQVIsQ0FBWSxpQkFBWixFQUErQixJQUEvQjtBQUNILEM7O2tCQUpnQixROzs7Ozs7Ozs7a0JDSk4sVUFBUyxLQUFULEVBQWdCO0FBQzNCLFdBQU87QUFDSCxrQkFBVSxHQURQO0FBRUgsaUJBQVMsSUFGTjtBQUdILG9CQUFZLEtBSFQ7QUFJSCxrQkFBVSx3SUFKUDtBQUtILGNBQU0sY0FBVSxLQUFWLEVBQWlCLE9BQWpCLEVBQTBCLEtBQTFCLEVBQWlDO0FBQ25DLGtCQUFNLE9BQU4sR0FBZ0IsSUFBaEI7QUFDQSxrQkFBTSxHQUFOLENBQVUsa0NBQVYsRUFBOEMsT0FBOUMsQ0FBc0QsVUFBVSxJQUFWLEVBQWdCO0FBQ2xFLHNCQUFNLFFBQU4sR0FBaUIsSUFBakI7QUFDQSxzQkFBTSxPQUFOLEdBQWdCLEtBQWhCO0FBQ0gsYUFIRDtBQUlIO0FBWEUsS0FBUDtBQWFILEM7O0FBQUE7Ozs7Ozs7OztrQkNMYyxVQUFTLGNBQVQsRUFBeUIsaUJBQXpCLEVBQTRDLFlBQTVDLEVBQTBEOztBQUdyRSxpQkFBYSxPQUFiLENBQXFCLEtBQXJCOztBQUVBLG1CQUFlLElBQWYsQ0FBb0IsT0FBcEIsRUFBNkI7QUFDekIscUJBQWEsc0JBRFk7QUFFekIsa0NBRnlCO0FBR3pCLHNCQUFjO0FBSFcsS0FBN0I7O0FBTUEsbUJBQWUsSUFBZixDQUFvQixPQUFwQixFQUE2QjtBQUN6QixxQkFBYSxtQkFEWTtBQUV6QixrQ0FGeUI7QUFHekIsc0JBQWM7QUFIVyxLQUE3Qjs7QUFNQSxtQkFBZSxJQUFmLENBQW9CLFFBQXBCLEVBQThCO0FBQzFCLHFCQUFhLG1CQURhO0FBRTFCLG1DQUYwQjtBQUcxQixzQkFBYztBQUhZLEtBQTlCOztBQU1BLG1CQUFlLFNBQWYsQ0FBeUIsT0FBekI7O0FBRUEsc0JBQWtCLFNBQWxCLENBQTRCLElBQTVCO0FBRUgsQzs7QUFqQ0Q7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUErQkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEVycm9yQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL0Vycm9yJztcbmltcG9ydCBNYWluQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9NYWluJztcbmltcG9ydCBUb2RvQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9Ub2RvJztcbmltcG9ydCBSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IFByb2R1Y3RMaXN0IGZyb20gJy4vZGlyZWN0aXZlcy9Qcm9kdWN0TGlzdCc7XG5cbi8vIGRyZWFtXG4vL2ltcG9ydCB7IEFuZ3VsYXJDbGllbnQgfSBmcm9tICcuL2NsaWVudCc7XG5cblxudmFyIG1vZHVsZU5hbWU9J215QXBwJztcblxud2luZG93W21vZHVsZU5hbWVdID0gYW5ndWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1vZHVsZShtb2R1bGVOYW1lLCBbJ25nUmVzb3VyY2UnLCAnbmdSb3V0ZSddKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmZpZyhSb3V0ZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignTWFpbkN0cmwnLCBNYWluQ3RybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdUb2RvQ3RybCcsIFRvZG9DdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ0Vycm9yQ3RybCcsIEVycm9yQ3RybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kaXJlY3RpdmUoJ3Byb2R1Y3RMaXN0JyxQcm9kdWN0TGlzdCk7XG5cbmNvbnNvbGUubG9nKCdVUkwgPSAnLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4vKlxuXG5cbndpbmRvd1ttb2R1bGVOYW1lXS5jb25maWcoZnVuY3Rpb24oICRpbmplY3RvciwgJGh0dHBQcm92aWRlciwgJGNhY2hlRmFjdG9yeVByb3ZpZGVyKSB7XG5cblxuICAgIHZhciBteUluamVjdG9yID0gYW5ndWxhci5pbmplY3RvcihbJ25nJ10pO1xuICAgIC8vY29uc29sZS5sb2coJ215SW5qZWN0b3IgPSAnLCBteUluamVjdG9yKTtcblxuICAgIHZhciBjYWNoZUZhY3RvcnkgPSAkY2FjaGVGYWN0b3J5UHJvdmlkZXIuJGdldDtcbiAgICAvL2NvbnNvbGUubG9nKGNhY2hlRmFjdG9yeSk7XG5cbiAgICB2YXIgc2VydmVyQ2FjaGUgPSBjYWNoZUZhY3RvcnkoJ3NlcnZlcicpO1xuXG4gICAgdmFyIGtleXMgPSB7fTtcblxuICAgIHZhciBhZGRLZXkgPSBmdW5jdGlvbihrZXkpIHtcblxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbnRlcmNlcHRIdHRwKCAkcSApIHtcbiAgICAgICAgcmV0dXJuKHtcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXG4gICAgICAgICAgICByZXF1ZXN0RXJyb3I6IHJlcXVlc3RFcnJvcixcbiAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IHJlc3BvbnNlRXJyb3JcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCggY29uZmlnICkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnU3RhdGluZyByZXF1ZXN0JywgY29uZmlnKTtcbiAgICAgICAgICAgIGlmICghY29uZmlnLmNhY2hlKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLmNhY2hlID0gc2VydmVyQ2FjaGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4oIGNvbmZpZyApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEVycm9yKCByZWplY3Rpb24gKSB7XG4gICAgICAgICAgICByZXR1cm4oICRxLnJlamVjdCggcmVqZWN0aW9uICkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlKCByZXNwb25zZSApIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2dldHRpbmcgcmVzcG9uc2UnLCByZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UuY29uZmlnLmNhY2hlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciBjYWNoZSA9IHJlc3BvbnNlLmNvbmZpZy5jYWNoZTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNhY2hlLmluZm8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4oIHJlc3BvbnNlICk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiByZXNwb25zZUVycm9yKCByZXNwb25zZSApIHtcbiAgICAgICAgICAgIHJldHVybiggJHEucmVqZWN0KCByZXNwb25zZSApICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCBpbnRlcmNlcHRIdHRwICk7XG59KTtcblxuKi9cbi8qKiBEcmVhbVxuXG5pZiAoIHR5cGVvZiB3aW5kb3cub25TZXJ2ZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgQW5ndWxhckNsaWVudChhbmd1bGFyLCBkb2N1bWVudCwgMTAwKTtcbn1cbiAqL1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gMTcvMDIvMTYuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3RvcigkbG9nKSB7XG5cbiAgICAgICAgY29uc3QgZXJyb3IxID0gJ0NhdGNoYWJsZSBFcnJvcigpJztcbiAgICAgICAgY29uc3QgZXJyb3IyID0gJ0NhdGNoYWJsZSBFeGNlcHRpb24oKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMyA9ICdVbmNhdGNoYWJsZSBFcnJvcigpIC0gc2hvdWxkIGNyYXNoIHRoZSBhcHAuJztcblxuICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IxKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKGVycm9yMSlcbiAgICAgICAgfSBjYXRjaCAoZTEpIHtcbiAgICAgICAgICAgICRsb2cubG9nKCdJIGNhdGNoZWQgYW4gRXJyb3IvRXhjZXB0aW9uOiAnICsgZTEgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMik7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZTIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUyICk7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMyk7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yID0gKHRleHQpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH07XG5cbiAgICB0aHJvd0V4Y2VwdGlvbiA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IHRleHQ7XG4gICAgfTtcblxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cblxuY2xhc3MgTWFpbkN0cmwge1xuICAgIGNvbnN0cnVjdG9yKCRsb2cpe1xuXG4gICAgICAgICRsb2cubG9nKCdJIGFtIGEgbG9nJywgJ3dpdGggdHdvIHBhcmFtZXRlcnMnKTtcbiAgICAgICAgJGxvZy53YXJuKCdJIGFtIGEgd2FybicpO1xuICAgICAgICAkbG9nLmluZm8oJ0kgYW0gYW4gaW5mbycpO1xuICAgICAgICAvKiRsb2cuZXJyb3IoJ0kgYW0gZXJyb3Igd2l0aCBhbiBvYmplY3QnLCB7XG4gICAgICAgICAgICBuYW1lOiAndmFsdWUnXG4gICAgICAgIH0pOyovXG5cblxuICAgIH1cblxuICAgIHRpdGxlID0gJ0FuZ3VsYXIgRXM2IHJldmlzaXRlZCc7XG59XG5leHBvcnQgZGVmYXVsdCBNYWluQ3RybDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvZG9DdHJsIHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUb2RvQ3RybCBMb2FkZWQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhZGRUb2RvID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZG9zLnB1c2goe3RleHQ6dGhpcy50b2RvVGV4dCwgZG9uZTpmYWxzZX0pO1xuICAgICAgICB0aGlzLnRvZG9UZXh0ID0gJyc7XG4gICAgfTtcblxuXG4gICAgdGl0bGUgPSBcIlRvZG9zIHRpdGxlXCI7XG5cbiAgICB0b2RvcyA9IFtcbiAgICAgICAge3RleHQ6J2xlYXJuIGFuZ3VsYXInLCBkb25lOnRydWV9LFxuICAgICAgICB7dGV4dDonYnVpbGQgYW4gYW5ndWxhciBhcHAnLCBkb25lOmZhbHNlfV07XG5cbiAgICB0b2RvVGV4dCA9ICcnO1xuXG5cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXY+PHNwYW4gbmctc2hvdz1cImxvYWRpbmdcIj5sb2FkaW5nIHByb2R1Y3RzPC9zcGFuPiA8bGkgbmctcmVwZWF0PVwicHJvZHVjdCBpbiBwcm9kdWN0c1wiPnt7cHJvZHVjdC5uYW1lfX0ge3twcm9kdWN0LnByaWNlfX08L2xpPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdodHRwOi8vYXBpLmV4YW1wbGU6ODA4MC9wcm9kdWN0cycpLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5wcm9kdWN0cyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cbmltcG9ydCBNYWluQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuXG4vL2ltcG9ydCB7SW5qZWN0U2VydmVyfSBmcm9tICcuLi9hbmd1bGFyL3NlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHNjZVByb3ZpZGVyKSB7XG5cblxuICAgICRzY2VQcm92aWRlci5lbmFibGVkKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9NYWluJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy92aWV3cy9wcm9kdWN0cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTWFpbkN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL1RvZG8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3RvZG9zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBUb2RvQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvRXJyb3InLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL2Vycm9yLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBFcnJvckN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKCcvTWFpbicpO1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG59OyJdfQ==
