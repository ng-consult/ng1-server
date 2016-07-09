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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwic3JjL2NvbnRyb2xsZXJzL01haW4uanMiLCJzcmMvY29udHJvbGxlcnMvVG9kby5qcyIsInNyYy9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwic3JjL3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7O0FBTUEsSUFBSSxhQUFXLE9BQWY7O0FBRUEsT0FBTyxVQUFQLElBQXFCLFFBQ0ksTUFESixDQUNXLFVBRFgsRUFDdUIsQ0FBQyxZQUFELEVBQWUsU0FBZixDQUR2QixFQUVJLE1BRkosbUJBR0ksVUFISixDQUdlLFVBSGYsa0JBSUksVUFKSixDQUllLFVBSmYsa0JBS0ksVUFMSixDQUtlLFdBTGYsbUJBTUksU0FOSixDQU1jLGFBTmQsd0JBQXJCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDVHFCLFMsR0FFakIsbUJBQVksSUFBWixFQUFrQjtBQUFBOztBQUFBLFNBd0JsQixVQXhCa0IsR0F3QkwsVUFBQyxJQUFELEVBQVU7QUFDbkIsY0FBTSxJQUFJLEtBQUosQ0FBVSxJQUFWLENBQU47QUFDSCxLQTFCaUI7O0FBQUEsU0E0QmxCLGNBNUJrQixHQTRCRCxVQUFDLElBQUQsRUFBVTtBQUN2QixjQUFNLElBQU47QUFDSCxLQTlCaUI7O0FBRWQsUUFBTSxTQUFTLG1CQUFmO0FBQ0EsUUFBTSxTQUFTLHVCQUFmO0FBQ0EsUUFBTSxTQUFTLDZDQUFmOztBQUVBLFNBQUssR0FBTCxDQUFTLGFBQWEsTUFBdEI7O0FBRUEsUUFBSTtBQUNBLGFBQUssVUFBTCxDQUFnQixNQUFoQjtBQUNILEtBRkQsQ0FFRSxPQUFPLEVBQVAsRUFBVztBQUNULGFBQUssR0FBTCxDQUFTLG1DQUFtQyxFQUE1QztBQUNBLFlBQUk7QUFDQSxpQkFBSyxHQUFMLENBQVMsYUFBYSxNQUF0QjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsTUFBcEI7QUFDSCxTQUhELENBR0UsT0FBTyxFQUFQLEVBQVc7QUFDVCxpQkFBSyxHQUFMLENBQVMsbUNBQW1DLEVBQTVDO0FBQ0EsaUJBQUssR0FBTCxDQUFTLGFBQWEsTUFBdEI7QUFDQSxpQkFBSyxjQUFMLENBQW9CLE1BQXBCO0FBRUg7QUFDSjtBQUNKLEM7O2tCQXhCZ0IsUzs7Ozs7Ozs7Ozs7Ozs7O0lDQ2YsUSxHQUNGLGtCQUFZLElBQVosRUFBaUI7QUFBQTs7QUFBQSxTQVlqQixLQVppQixHQVlULHVCQVpTOzs7QUFFYixTQUFLLEdBQUwsQ0FBUyxZQUFULEVBQXVCLHFCQUF2QjtBQUNBLFNBQUssSUFBTCxDQUFVLGFBQVY7QUFDQSxTQUFLLElBQUwsQ0FBVSxjQUFWOzs7O0FBTUgsQzs7a0JBSVUsUTs7Ozs7Ozs7Ozs7Ozs7O0lDZk0sUSxHQUVqQixvQkFBYTtBQUFBOztBQUFBOztBQUFBLFNBSWIsT0FKYSxHQUlILFlBQU07QUFDWixjQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEVBQUMsTUFBSyxNQUFLLFFBQVgsRUFBcUIsTUFBSyxLQUExQixFQUFoQjtBQUNBLGNBQUssUUFBTCxHQUFnQixFQUFoQjtBQUNILEtBUFk7O0FBQUEsU0FVYixLQVZhLEdBVUwsYUFWSztBQUFBLFNBWWIsS0FaYSxHQVlMLENBQ0osRUFBQyxNQUFLLGVBQU4sRUFBdUIsTUFBSyxJQUE1QixFQURJLEVBRUosRUFBQyxNQUFLLHNCQUFOLEVBQThCLE1BQUssS0FBbkMsRUFGSSxDQVpLO0FBQUEsU0FnQmIsUUFoQmEsR0FnQkYsRUFoQkU7O0FBQ1QsWUFBUSxHQUFSLENBQVksaUJBQVosRUFBK0IsSUFBL0I7QUFDSCxDOztrQkFKZ0IsUTs7Ozs7Ozs7O2tCQ0pOLFVBQVMsS0FBVCxFQUFnQjtBQUMzQixXQUFPO0FBQ0gsa0JBQVUsR0FEUDtBQUVILGlCQUFTLElBRk47QUFHSCxvQkFBWSxLQUhUO0FBSUgsa0JBQVUsd0lBSlA7QUFLSCxjQUFNLGNBQVUsS0FBVixFQUFpQixPQUFqQixFQUEwQixLQUExQixFQUFpQztBQUNuQyxrQkFBTSxPQUFOLEdBQWdCLElBQWhCO0FBQ0Esa0JBQU0sR0FBTixDQUFVLGtDQUFWLEVBQThDLE9BQTlDLENBQXNELFVBQVUsSUFBVixFQUFnQjtBQUNsRSxzQkFBTSxRQUFOLEdBQWlCLElBQWpCO0FBQ0Esc0JBQU0sT0FBTixHQUFnQixLQUFoQjtBQUNILGFBSEQ7QUFJSDtBQVhFLEtBQVA7QUFhSCxDOztBQUFBOzs7Ozs7Ozs7a0JDTGMsVUFBUyxjQUFULEVBQXlCLGlCQUF6QixFQUE0QyxZQUE1QyxFQUEwRDs7QUFHckUsaUJBQWEsT0FBYixDQUFxQixLQUFyQjs7QUFFQSxtQkFBZSxJQUFmLENBQW9CLE9BQXBCLEVBQTZCO0FBQ3pCLHFCQUFhLHVCQURZO0FBRXpCLGtDQUZ5QjtBQUd6QixzQkFBYztBQUhXLEtBQTdCOztBQU1BLG1CQUFlLElBQWYsQ0FBb0IsT0FBcEIsRUFBNkI7QUFDekIscUJBQWEsb0JBRFk7QUFFekIsa0NBRnlCO0FBR3pCLHNCQUFjO0FBSFcsS0FBN0I7O0FBTUEsbUJBQWUsSUFBZixDQUFvQixRQUFwQixFQUE4QjtBQUMxQixxQkFBYSxvQkFEYTtBQUUxQixtQ0FGMEI7QUFHMUIsc0JBQWM7QUFIWSxLQUE5Qjs7OztBQVFBLG1CQUFlLFNBQWYsQ0FBeUIsT0FBekI7O0FBRUEsc0JBQWtCLFNBQWxCLENBQTRCLElBQTVCO0FBRUgsQzs7QUFuQ0Q7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7QUFpQ0MiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEVycm9yQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL0Vycm9yJztcbmltcG9ydCBNYWluQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9NYWluJztcbmltcG9ydCBUb2RvQ3RybCAgZnJvbSAnLi9jb250cm9sbGVycy9Ub2RvJztcbmltcG9ydCBSb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IFByb2R1Y3RMaXN0IGZyb20gJy4vZGlyZWN0aXZlcy9Qcm9kdWN0TGlzdCc7XG5cbi8vIGRyZWFtXG4vL2ltcG9ydCB7IEFuZ3VsYXJDbGllbnQgfSBmcm9tICcuL2NsaWVudCc7XG5cblxudmFyIG1vZHVsZU5hbWU9J215QXBwJztcblxud2luZG93W21vZHVsZU5hbWVdID0gYW5ndWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgLm1vZHVsZShtb2R1bGVOYW1lLCBbJ25nUmVzb3VyY2UnLCAnbmdSb3V0ZSddKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmZpZyhSb3V0ZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignTWFpbkN0cmwnLCBNYWluQ3RybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdUb2RvQ3RybCcsIFRvZG9DdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ0Vycm9yQ3RybCcsIEVycm9yQ3RybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kaXJlY3RpdmUoJ3Byb2R1Y3RMaXN0JyxQcm9kdWN0TGlzdCk7XG5cblxuLyoqIERyZWFtXG5cbmlmICggdHlwZW9mIHdpbmRvdy5vblNlcnZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBBbmd1bGFyQ2xpZW50KGFuZ3VsYXIsIGRvY3VtZW50LCAxMDApO1xufVxuICovXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiAxNy8wMi8xNi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JDdHJsIHtcblxuICAgIGNvbnN0cnVjdG9yKCRsb2cpIHtcblxuICAgICAgICBjb25zdCBlcnJvcjEgPSAnQ2F0Y2hhYmxlIEVycm9yKCknO1xuICAgICAgICBjb25zdCBlcnJvcjIgPSAnQ2F0Y2hhYmxlIEV4Y2VwdGlvbigpJztcbiAgICAgICAgY29uc3QgZXJyb3IzID0gJ1VuY2F0Y2hhYmxlIEVycm9yKCkgLSBzaG91bGQgY3Jhc2ggdGhlIGFwcC4nO1xuXG4gICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjEpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoZXJyb3IxKVxuICAgICAgICB9IGNhdGNoIChlMSkge1xuICAgICAgICAgICAgJGxvZy5sb2coJ0kgY2F0Y2hlZCBhbiBFcnJvci9FeGNlcHRpb246ICcgKyBlMSApO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXhjZXB0aW9uKGVycm9yMik7XG4gICAgICAgICAgICB9IGNhdGNoIChlMikge1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdJIGNhdGNoZWQgYW4gRXJyb3IvRXhjZXB0aW9uOiAnICsgZTIgKTtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXhjZXB0aW9uKGVycm9yMyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRocm93RXJyb3IgPSAodGV4dCkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGV4dCk7XG4gICAgfTtcblxuICAgIHRocm93RXhjZXB0aW9uID0gKHRleHQpID0+IHtcbiAgICAgICAgdGhyb3cgdGV4dDtcbiAgICB9O1xuXG59IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gOS8wMi8xNi5cbiAqL1xuXG5jbGFzcyBNYWluQ3RybCB7XG4gICAgY29uc3RydWN0b3IoJGxvZyl7XG5cbiAgICAgICAgJGxvZy5sb2coJ0kgYW0gYSBsb2cnLCAnd2l0aCB0d28gcGFyYW1ldGVycycpO1xuICAgICAgICAkbG9nLndhcm4oJ0kgYW0gYSB3YXJuJyk7XG4gICAgICAgICRsb2cuaW5mbygnSSBhbSBhbiBpbmZvJyk7XG4gICAgICAgIC8qJGxvZy5lcnJvcignSSBhbSBlcnJvciB3aXRoIGFuIG9iamVjdCcsIHtcbiAgICAgICAgICAgIG5hbWU6ICd2YWx1ZSdcbiAgICAgICAgfSk7Ki9cblxuXG4gICAgfVxuXG4gICAgdGl0bGUgPSAnQW5ndWxhciBFczYgcmV2aXNpdGVkJztcbn1cbmV4cG9ydCBkZWZhdWx0IE1haW5DdHJsOyIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9kb0N0cmwge1xuXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgY29uc29sZS5sb2coJ1RvZG9DdHJsIExvYWRlZCcsIHRoaXMpO1xuICAgIH1cblxuICAgIGFkZFRvZG8gPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9kb3MucHVzaCh7dGV4dDp0aGlzLnRvZG9UZXh0LCBkb25lOmZhbHNlfSk7XG4gICAgICAgIHRoaXMudG9kb1RleHQgPSAnJztcbiAgICB9O1xuXG5cbiAgICB0aXRsZSA9IFwiVG9kb3MgdGl0bGVcIjtcblxuICAgIHRvZG9zID0gW1xuICAgICAgICB7dGV4dDonbGVhcm4gYW5ndWxhcicsIGRvbmU6dHJ1ZX0sXG4gICAgICAgIHt0ZXh0OididWlsZCBhbiBhbmd1bGFyIGFwcCcsIGRvbmU6ZmFsc2V9XTtcblxuICAgIHRvZG9UZXh0ID0gJyc7XG5cblxufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogZmFsc2UsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdj48c3BhbiBuZy1zaG93PVwibG9hZGluZ1wiPmxvYWRpbmcgcHJvZHVjdHM8L3NwYW4+IDxsaSBuZy1yZXBlYXQ9XCJwcm9kdWN0IGluIHByb2R1Y3RzXCI+e3twcm9kdWN0Lm5hbWV9fSB7e3Byb2R1Y3QucHJpY2V9fTwvbGk+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgc2NvcGUubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICAkaHR0cC5nZXQoJ2h0dHA6Ly9hcGkuZXhhbXBsZTo4MDgwL3Byb2R1Y3RzJykuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnByb2R1Y3RzID0gZGF0YTtcbiAgICAgICAgICAgICAgICBzY29wZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gOS8wMi8xNi5cbiAqL1xuaW1wb3J0IE1haW5DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvTWFpbic7XG5pbXBvcnQgVG9kb0N0cmwgZnJvbSAnLi9jb250cm9sbGVycy9Ub2RvJztcbmltcG9ydCBFcnJvckN0cmwgZnJvbSAnLi9jb250cm9sbGVycy9FcnJvcic7XG5cbi8vaW1wb3J0IHtJbmplY3RTZXJ2ZXJ9IGZyb20gJy4uL2FuZ3VsYXIvc2VydmVyJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkc2NlUHJvdmlkZXIpIHtcblxuXG4gICAgJHNjZVByb3ZpZGVyLmVuYWJsZWQoZmFsc2UpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL01haW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy9wcm9kdWN0cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogTWFpbkN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL1RvZG8nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnLi92aWV3cy90b2Rvcy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogVG9kb0N0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL0Vycm9yJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvZXJyb3IuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IEVycm9yQ3RybCxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nXG4gICAgfSk7XG5cbiAgICAvLyRsb2NhdGlvblByb3ZpZGVyLmhhc2hQcmVmaXgoJyEhIScpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKCcvTWFpbicpO1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuXG59OyJdfQ==
