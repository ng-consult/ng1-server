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

window['myApp'] = angular.module('myApp', ['ngResource', 'ngRoute']).config(_routes2.default).controller('MainCtrl', _Main2.default).controller('TodoCtrl', _Todo2.default).controller('ErrorCtrl', _Error2.default).directive('productList', _ProductList2.default);

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

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Created by antoine on 9/02/16.
 */
;

//import {InjectServer} from '../angular/server';

},{"./controllers/Error":2,"./controllers/Main":3,"./controllers/Todo":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXBwLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwiY2xpZW50L2NvbnRyb2xsZXJzL01haW4uanMiLCJjbGllbnQvY29udHJvbGxlcnMvVG9kby5qcyIsImNsaWVudC9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwiY2xpZW50L3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFHQSxPQUFBLEFBQU8sV0FBVyxRQUFBLEFBQVEsT0FBUixBQUFlLFNBQVMsQ0FBQSxBQUFDLGNBQXpCLEFBQXdCLEFBQWUsWUFBdkMsQUFDYix5QkFEYSxBQUViLFdBRmEsQUFFRiw0QkFGRSxBQUdiLFdBSGEsQUFHRiw0QkFIRSxBQUliLFdBSmEsQUFJRiw4QkFKRSxBQUtiLFVBTGEsQUFLSCw2QkFMZjs7Ozs7Ozs7Ozs7Ozs7O0lDSnFCLFMsR0FFakIsbUJBQVksSUFBWixFQUFrQjtBQUFBOztBQUFBLFNBd0JsQixVQXhCa0IsR0F3QkwsVUFBQyxJQUFELEVBQVU7QUFDbkIsY0FBTSxJQUFJLEtBQUosQ0FBVSxJQUFWLENBQU47QUFDSCxLQTFCaUI7O0FBQUEsU0E0QmxCLGNBNUJrQixHQTRCRCxVQUFDLElBQUQsRUFBVTtBQUN2QixjQUFNLElBQU47QUFDSCxLQTlCaUI7O0FBRWQsUUFBTSxTQUFTLG1CQUFmO0FBQ0EsUUFBTSxTQUFTLHVCQUFmO0FBQ0EsUUFBTSxTQUFTLDZDQUFmOztBQUVBLFNBQUssR0FBTCxDQUFTLGFBQWEsTUFBdEI7O0FBRUEsUUFBSTtBQUNBLGFBQUssVUFBTCxDQUFnQixNQUFoQjtBQUNILEtBRkQsQ0FFRSxPQUFPLEVBQVAsRUFBVztBQUNULGFBQUssR0FBTCxDQUFTLG1DQUFtQyxFQUE1QztBQUNBLFlBQUk7QUFDQSxpQkFBSyxHQUFMLENBQVMsYUFBYSxNQUF0QjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsTUFBcEI7QUFDSCxTQUhELENBR0UsT0FBTyxFQUFQLEVBQVc7QUFDVCxpQkFBSyxHQUFMLENBQVMsbUNBQW1DLEVBQTVDO0FBQ0EsaUJBQUssR0FBTCxDQUFTLGFBQWEsTUFBdEI7QUFDQSxpQkFBSyxjQUFMLENBQW9CLE1BQXBCO0FBRUg7QUFDSjtBQUNKLEM7O2tCQXhCZ0IsUzs7Ozs7Ozs7Ozs7Ozs7O0lDQ2YsUSxHQUNGLGtCQUFZLElBQVosRUFBaUI7QUFBQTs7QUFBQSxTQVlqQixLQVppQixHQVlULHVCQVpTOzs7QUFFYixTQUFLLEdBQUwsQ0FBUyxZQUFULEVBQXVCLHFCQUF2QjtBQUNBLFNBQUssSUFBTCxDQUFVLGFBQVY7QUFDQSxTQUFLLElBQUwsQ0FBVSxjQUFWOzs7O0FBTUgsQzs7a0JBSVUsUTs7Ozs7Ozs7Ozs7Ozs7O0lDZk0sUSxHQUVqQixvQkFBYTtBQUFBOztBQUFBOztBQUFBLFNBSWIsT0FKYSxHQUlILFlBQU07QUFDWixjQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEVBQUMsTUFBSyxNQUFLLFFBQVgsRUFBcUIsTUFBSyxLQUExQixFQUFoQjtBQUNBLGNBQUssUUFBTCxHQUFnQixFQUFoQjtBQUNILEtBUFk7O0FBQUEsU0FVYixLQVZhLEdBVUwsYUFWSztBQUFBLFNBWWIsS0FaYSxHQVlMLENBQ0osRUFBQyxNQUFLLGVBQU4sRUFBdUIsTUFBSyxJQUE1QixFQURJLEVBRUosRUFBQyxNQUFLLHNCQUFOLEVBQThCLE1BQUssS0FBbkMsRUFGSSxDQVpLO0FBQUEsU0FnQmIsUUFoQmEsR0FnQkYsRUFoQkU7O0FBQ1QsWUFBUSxHQUFSLENBQVksaUJBQVosRUFBK0IsSUFBL0I7QUFDSCxDOztrQkFKZ0IsUTs7Ozs7Ozs7O2tCQ0pOLFVBQVMsS0FBVCxFQUFnQjtBQUMzQixXQUFPO0FBQ0gsa0JBQVUsR0FEUDtBQUVILGlCQUFTLElBRk47QUFHSCxvQkFBWSxLQUhUO0FBSUgsa0JBQVUsd0lBSlA7QUFLSCxjQUFNLGNBQVUsS0FBVixFQUFpQixPQUFqQixFQUEwQixLQUExQixFQUFpQztBQUNuQyxrQkFBTSxPQUFOLEdBQWdCLElBQWhCO0FBQ0Esa0JBQU0sR0FBTixDQUFVLGtDQUFWLEVBQThDLE9BQTlDLENBQXNELFVBQVUsSUFBVixFQUFnQjtBQUNsRSxzQkFBTSxRQUFOLEdBQWlCLElBQWpCO0FBQ0Esc0JBQU0sT0FBTixHQUFnQixLQUFoQjtBQUNILGFBSEQ7QUFJSDtBQVhFLEtBQVA7QUFhSCxDOztBQUFBOzs7Ozs7Ozs7a0JDTGMsVUFBQSxBQUFTLGdCQUFULEFBQXlCLG1CQUF6QixBQUE0QyxjQUFjLEFBR3JFOztpQkFBQSxBQUFhLFFBQWIsQUFBcUIsQUFFckI7O21CQUFBLEFBQWUsS0FBZixBQUFvQjtxQkFBUyxBQUNaLEFBQ2I7MkJBRnlCLEFBR3pCO3NCQUhKLEFBQTZCLEFBQ3pCLEFBRWMsQUFHbEI7OzttQkFBQSxBQUFlLEtBQWYsQUFBb0I7cUJBQVMsQUFDWixBQUNiOzJCQUZ5QixBQUd6QjtzQkFISixBQUE2QixBQUN6QixBQUVjLEFBR2xCOzs7bUJBQUEsQUFBZSxLQUFmLEFBQW9CO3FCQUFVLEFBQ2IsQUFDYjs0QkFGMEIsQUFHMUI7c0JBSEosQUFBOEIsQUFDMUIsQUFFYyxBQUdsQjs7O21CQUFBLEFBQWUsVUFBZixBQUF5QixBQUV6Qjs7c0JBQUEsQUFBa0IsVSxBQUFsQixBQUE0QixBQUUvQjs7O0FBakNEOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7QUErQkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEVycm9yQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL0Vycm9yJztcbmltcG9ydCBNYWluQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9NYWluJztcbmltcG9ydCBUb2RvQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9Ub2RvJztcbmltcG9ydCBSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IFByb2R1Y3RMaXN0IGZyb20gJy4vZGlyZWN0aXZlcy9Qcm9kdWN0TGlzdCc7XG5cblxud2luZG93WydteUFwcCddID0gYW5ndWxhci5tb2R1bGUoJ215QXBwJywgWyduZ1Jlc291cmNlJywgJ25nUm91dGUnXSlcbiAgICAuY29uZmlnKFJvdXRlcylcbiAgICAuY29udHJvbGxlcignTWFpbkN0cmwnLCBNYWluQ3RybClcbiAgICAuY29udHJvbGxlcignVG9kb0N0cmwnLCBUb2RvQ3RybClcbiAgICAuY29udHJvbGxlcignRXJyb3JDdHJsJywgRXJyb3JDdHJsKVxuICAgIC5kaXJlY3RpdmUoJ3Byb2R1Y3RMaXN0JywgUHJvZHVjdExpc3QpO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gMTcvMDIvMTYuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3RvcigkbG9nKSB7XG5cbiAgICAgICAgY29uc3QgZXJyb3IxID0gJ0NhdGNoYWJsZSBFcnJvcigpJztcbiAgICAgICAgY29uc3QgZXJyb3IyID0gJ0NhdGNoYWJsZSBFeGNlcHRpb24oKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMyA9ICdVbmNhdGNoYWJsZSBFcnJvcigpIC0gc2hvdWxkIGNyYXNoIHRoZSBhcHAuJztcblxuICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IxKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKGVycm9yMSlcbiAgICAgICAgfSBjYXRjaCAoZTEpIHtcbiAgICAgICAgICAgICRsb2cubG9nKCdJIGNhdGNoZWQgYW4gRXJyb3IvRXhjZXB0aW9uOiAnICsgZTEgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMik7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZTIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUyICk7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMyk7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yID0gKHRleHQpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH07XG5cbiAgICB0aHJvd0V4Y2VwdGlvbiA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IHRleHQ7XG4gICAgfTtcblxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cblxuY2xhc3MgTWFpbkN0cmwge1xuICAgIGNvbnN0cnVjdG9yKCRsb2cpe1xuXG4gICAgICAgICRsb2cubG9nKCdJIGFtIGEgbG9nJywgJ3dpdGggdHdvIHBhcmFtZXRlcnMnKTtcbiAgICAgICAgJGxvZy53YXJuKCdJIGFtIGEgd2FybicpO1xuICAgICAgICAkbG9nLmluZm8oJ0kgYW0gYW4gaW5mbycpO1xuICAgICAgICAvKiRsb2cuZXJyb3IoJ0kgYW0gZXJyb3Igd2l0aCBhbiBvYmplY3QnLCB7XG4gICAgICAgICAgICBuYW1lOiAndmFsdWUnXG4gICAgICAgIH0pOyovXG5cblxuICAgIH1cblxuICAgIHRpdGxlID0gJ0FuZ3VsYXIgRXM2IHJldmlzaXRlZCc7XG59XG5leHBvcnQgZGVmYXVsdCBNYWluQ3RybDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvZG9DdHJsIHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUb2RvQ3RybCBMb2FkZWQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhZGRUb2RvID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZG9zLnB1c2goe3RleHQ6dGhpcy50b2RvVGV4dCwgZG9uZTpmYWxzZX0pO1xuICAgICAgICB0aGlzLnRvZG9UZXh0ID0gJyc7XG4gICAgfTtcblxuXG4gICAgdGl0bGUgPSBcIlRvZG9zIHRpdGxlXCI7XG5cbiAgICB0b2RvcyA9IFtcbiAgICAgICAge3RleHQ6J2xlYXJuIGFuZ3VsYXInLCBkb25lOnRydWV9LFxuICAgICAgICB7dGV4dDonYnVpbGQgYW4gYW5ndWxhciBhcHAnLCBkb25lOmZhbHNlfV07XG5cbiAgICB0b2RvVGV4dCA9ICcnO1xuXG5cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXY+PHNwYW4gbmctc2hvdz1cImxvYWRpbmdcIj5sb2FkaW5nIHByb2R1Y3RzPC9zcGFuPiA8bGkgbmctcmVwZWF0PVwicHJvZHVjdCBpbiBwcm9kdWN0c1wiPnt7cHJvZHVjdC5uYW1lfX0ge3twcm9kdWN0LnByaWNlfX08L2xpPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdodHRwOi8vYXBpLmV4YW1wbGU6ODA4MC9wcm9kdWN0cycpLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5wcm9kdWN0cyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cbmltcG9ydCBNYWluQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuXG4vL2ltcG9ydCB7SW5qZWN0U2VydmVyfSBmcm9tICcuLi9hbmd1bGFyL3NlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHNjZVByb3ZpZGVyKSB7XG5cblxuICAgICRzY2VQcm92aWRlci5lbmFibGVkKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9NYWluJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy92aWV3cy9wcm9kdWN0cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTWFpbkN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL1RvZG8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3RvZG9zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBUb2RvQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvRXJyb3InLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3ZpZXdzL2Vycm9yLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBFcnJvckN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKCcvTWFpbicpO1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG59OyJdfQ==
