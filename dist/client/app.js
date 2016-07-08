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

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Created by antoine on 9/02/16.
 */
;

//import {InjectServer} from '../angular/server';

},{"./controllers/Error":2,"./controllers/Main":3,"./controllers/Todo":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NvbnRyb2xsZXJzL0Vycm9yLmpzIiwic3JjL2NvbnRyb2xsZXJzL01haW4uanMiLCJzcmMvY29udHJvbGxlcnMvVG9kby5qcyIsInNyYy9kaXJlY3RpdmVzL1Byb2R1Y3RMaXN0LmpzIiwic3JjL3JvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7QUFNQSxJQUFJLGFBQUosQUFBZTs7QUFFZixPQUFBLEFBQU8sY0FBYyxRQUFBLEFBQ0ksT0FESixBQUNXLFlBQVksQ0FBQSxBQUFDLGNBRHhCLEFBQ3VCLEFBQWUsWUFEdEMsQUFFSSx5QkFGSixBQUdJLFdBSEosQUFHZSw0QkFIZixBQUlJLFdBSkosQUFJZSw0QkFKZixBQUtJLFdBTEosQUFLZSw4QkFMZixBQU1JLFVBTkosQUFNYyw2QkFObkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNUcUIsUyxHQUVqQixtQkFBWSxJQUFaLEVBQWtCO0FBQUE7O0FBQUEsU0F3QmxCLFVBeEJrQixHQXdCTCxVQUFDLElBQUQsRUFBVTtBQUNuQixjQUFNLElBQUksS0FBSixDQUFVLElBQVYsQ0FBTjtBQUNILEtBMUJpQjs7QUFBQSxTQTRCbEIsY0E1QmtCLEdBNEJELFVBQUMsSUFBRCxFQUFVO0FBQ3ZCLGNBQU0sSUFBTjtBQUNILEtBOUJpQjs7QUFFZCxRQUFNLFNBQVMsbUJBQWY7QUFDQSxRQUFNLFNBQVMsdUJBQWY7QUFDQSxRQUFNLFNBQVMsNkNBQWY7O0FBRUEsU0FBSyxHQUFMLENBQVMsYUFBYSxNQUF0Qjs7QUFFQSxRQUFJO0FBQ0EsYUFBSyxVQUFMLENBQWdCLE1BQWhCO0FBQ0gsS0FGRCxDQUVFLE9BQU8sRUFBUCxFQUFXO0FBQ1QsYUFBSyxHQUFMLENBQVMsbUNBQW1DLEVBQTVDO0FBQ0EsWUFBSTtBQUNBLGlCQUFLLEdBQUwsQ0FBUyxhQUFhLE1BQXRCO0FBQ0EsaUJBQUssY0FBTCxDQUFvQixNQUFwQjtBQUNILFNBSEQsQ0FHRSxPQUFPLEVBQVAsRUFBVztBQUNULGlCQUFLLEdBQUwsQ0FBUyxtQ0FBbUMsRUFBNUM7QUFDQSxpQkFBSyxHQUFMLENBQVMsYUFBYSxNQUF0QjtBQUNBLGlCQUFLLGNBQUwsQ0FBb0IsTUFBcEI7QUFFSDtBQUNKO0FBQ0osQzs7a0JBeEJnQixTOzs7Ozs7Ozs7Ozs7Ozs7SUNDZixRLEdBQ0Ysa0JBQVksSUFBWixFQUFpQjtBQUFBOztBQUFBLFNBWWpCLEtBWmlCLEdBWVQsdUJBWlM7OztBQUViLFNBQUssR0FBTCxDQUFTLFlBQVQsRUFBdUIscUJBQXZCO0FBQ0EsU0FBSyxJQUFMLENBQVUsYUFBVjtBQUNBLFNBQUssSUFBTCxDQUFVLGNBQVY7Ozs7QUFNSCxDOztrQkFJVSxROzs7Ozs7Ozs7Ozs7Ozs7SUNmTSxRLEdBRWpCLG9CQUFhO0FBQUE7O0FBQUE7O0FBQUEsU0FJYixPQUphLEdBSUgsWUFBTTtBQUNaLGNBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsRUFBQyxNQUFLLE1BQUssUUFBWCxFQUFxQixNQUFLLEtBQTFCLEVBQWhCO0FBQ0EsY0FBSyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0gsS0FQWTs7QUFBQSxTQVViLEtBVmEsR0FVTCxhQVZLO0FBQUEsU0FZYixLQVphLEdBWUwsQ0FDSixFQUFDLE1BQUssZUFBTixFQUF1QixNQUFLLElBQTVCLEVBREksRUFFSixFQUFDLE1BQUssc0JBQU4sRUFBOEIsTUFBSyxLQUFuQyxFQUZJLENBWks7QUFBQSxTQWdCYixRQWhCYSxHQWdCRixFQWhCRTs7QUFDVCxZQUFRLEdBQVIsQ0FBWSxpQkFBWixFQUErQixJQUEvQjtBQUNILEM7O2tCQUpnQixROzs7Ozs7Ozs7a0JDSk4sVUFBQSxBQUFTLE9BQU8sQUFDM0I7O2tCQUFPLEFBQ08sQUFDVjtpQkFGRyxBQUVNLEFBQ1Q7b0JBSEcsQUFHUyxBQUNaO2tCQUpHLEFBSU8sQUFDVjtjQUFNLGNBQUEsQUFBVSxPQUFWLEFBQWlCLFNBQWpCLEFBQTBCLE9BQU8sQUFDbkM7a0JBQUEsQUFBTSxVQUFOLEFBQWdCLEFBQ2hCO2tCQUFBLEFBQU0sSUFBTixBQUFVLG9DQUFWLEFBQThDLFFBQVEsVUFBQSxBQUFVLE1BQU0sQUFDbEU7c0JBQUEsQUFBTSxXQUFOLEFBQWlCLEFBQ2pCO3NCQUFBLEFBQU0sVSxBQVRsQixBQUFPLEFBQ0gsQUFNSSxBQUVJLEFBQWdCLEFBQ25CLEFBQ0osQUFFUjs7Ozs7O0FBQUE7Ozs7Ozs7OztrQkNMYyxVQUFBLEFBQVMsZ0JBQVQsQUFBeUIsbUJBQXpCLEFBQTRDLGNBQWMsQUFHckU7O2lCQUFBLEFBQWEsUUFBYixBQUFxQixBQUVyQjs7bUJBQUEsQUFBZSxLQUFmLEFBQW9CO3FCQUFTLEFBQ1osQUFDYjsyQkFGeUIsQUFHekI7c0JBSEosQUFBNkIsQUFDekIsQUFFYyxBQUdsQjs7O21CQUFBLEFBQWUsS0FBZixBQUFvQjtxQkFBUyxBQUNaLEFBQ2I7MkJBRnlCLEFBR3pCO3NCQUhKLEFBQTZCLEFBQ3pCLEFBRWMsQUFHbEI7OzttQkFBQSxBQUFlLEtBQWYsQUFBb0I7cUJBQVUsQUFDYixBQUNiOzRCQUYwQixBQUcxQjtzQkFISixBQUE4QixBQUMxQixBQUVjLEFBS2xCOzs7OzttQkFBQSxBQUFlLFVBQWYsQUFBeUIsQUFFekI7O3NCQUFBLEFBQWtCLFUsQUFBbEIsQUFBNEIsQUFFL0I7OztBQW5DRDs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7O0FBaUNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBFcnJvckN0cmwgZnJvbSAnLi9jb250cm9sbGVycy9FcnJvcic7XG5pbXBvcnQgTWFpbkN0cmwgIGZyb20gJy4vY29udHJvbGxlcnMvTWFpbic7XG5pbXBvcnQgVG9kb0N0cmwgIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgUm91dGVzIGZyb20gJy4vcm91dGVzJztcbmltcG9ydCBQcm9kdWN0TGlzdCBmcm9tICcuL2RpcmVjdGl2ZXMvUHJvZHVjdExpc3QnO1xuXG4vLyBkcmVhbVxuLy9pbXBvcnQgeyBBbmd1bGFyQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQnO1xuXG5cbnZhciBtb2R1bGVOYW1lPSdteUFwcCc7XG5cbndpbmRvd1ttb2R1bGVOYW1lXSA9IGFuZ3VsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tb2R1bGUobW9kdWxlTmFtZSwgWyduZ1Jlc291cmNlJywgJ25nUm91dGUnXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb25maWcoUm91dGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ01haW5DdHJsJywgTWFpbkN0cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignVG9kb0N0cmwnLCBUb2RvQ3RybClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdFcnJvckN0cmwnLCBFcnJvckN0cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZGlyZWN0aXZlKCdwcm9kdWN0TGlzdCcsUHJvZHVjdExpc3QpO1xuXG5cbi8qKiBEcmVhbVxuXG5pZiAoIHR5cGVvZiB3aW5kb3cub25TZXJ2ZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgQW5ndWxhckNsaWVudChhbmd1bGFyLCBkb2N1bWVudCwgMTAwKTtcbn1cbiAqL1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gMTcvMDIvMTYuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3RvcigkbG9nKSB7XG5cbiAgICAgICAgY29uc3QgZXJyb3IxID0gJ0NhdGNoYWJsZSBFcnJvcigpJztcbiAgICAgICAgY29uc3QgZXJyb3IyID0gJ0NhdGNoYWJsZSBFeGNlcHRpb24oKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMyA9ICdVbmNhdGNoYWJsZSBFcnJvcigpIC0gc2hvdWxkIGNyYXNoIHRoZSBhcHAuJztcblxuICAgICAgICAkbG9nLmxvZygnV2lsbC4uLi4nICsgZXJyb3IxKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50aHJvd0Vycm9yKGVycm9yMSlcbiAgICAgICAgfSBjYXRjaCAoZTEpIHtcbiAgICAgICAgICAgICRsb2cubG9nKCdJIGNhdGNoZWQgYW4gRXJyb3IvRXhjZXB0aW9uOiAnICsgZTEgKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMik7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjIpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZTIpIHtcbiAgICAgICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUyICk7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMyk7XG4gICAgICAgICAgICAgICAgdGhpcy50aHJvd0V4Y2VwdGlvbihlcnJvcjMpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yID0gKHRleHQpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRleHQpO1xuICAgIH07XG5cbiAgICB0aHJvd0V4Y2VwdGlvbiA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IHRleHQ7XG4gICAgfTtcblxufSIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cblxuY2xhc3MgTWFpbkN0cmwge1xuICAgIGNvbnN0cnVjdG9yKCRsb2cpe1xuXG4gICAgICAgICRsb2cubG9nKCdJIGFtIGEgbG9nJywgJ3dpdGggdHdvIHBhcmFtZXRlcnMnKTtcbiAgICAgICAgJGxvZy53YXJuKCdJIGFtIGEgd2FybicpO1xuICAgICAgICAkbG9nLmluZm8oJ0kgYW0gYW4gaW5mbycpO1xuICAgICAgICAvKiRsb2cuZXJyb3IoJ0kgYW0gZXJyb3Igd2l0aCBhbiBvYmplY3QnLCB7XG4gICAgICAgICAgICBuYW1lOiAndmFsdWUnXG4gICAgICAgIH0pOyovXG5cblxuICAgIH1cblxuICAgIHRpdGxlID0gJ0FuZ3VsYXIgRXM2IHJldmlzaXRlZCc7XG59XG5leHBvcnQgZGVmYXVsdCBNYWluQ3RybDsiLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvZG9DdHJsIHtcblxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUb2RvQ3RybCBMb2FkZWQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBhZGRUb2RvID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZG9zLnB1c2goe3RleHQ6dGhpcy50b2RvVGV4dCwgZG9uZTpmYWxzZX0pO1xuICAgICAgICB0aGlzLnRvZG9UZXh0ID0gJyc7XG4gICAgfTtcblxuXG4gICAgdGl0bGUgPSBcIlRvZG9zIHRpdGxlXCI7XG5cbiAgICB0b2RvcyA9IFtcbiAgICAgICAge3RleHQ6J2xlYXJuIGFuZ3VsYXInLCBkb25lOnRydWV9LFxuICAgICAgICB7dGV4dDonYnVpbGQgYW4gYW5ndWxhciBhcHAnLCBkb25lOmZhbHNlfV07XG5cbiAgICB0b2RvVGV4dCA9ICcnO1xuXG5cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IGZhbHNlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXY+PHNwYW4gbmctc2hvdz1cImxvYWRpbmdcIj5sb2FkaW5nIHByb2R1Y3RzPC9zcGFuPiA8bGkgbmctcmVwZWF0PVwicHJvZHVjdCBpbiBwcm9kdWN0c1wiPnt7cHJvZHVjdC5uYW1lfX0ge3twcm9kdWN0LnByaWNlfX08L2xpPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJGh0dHAuZ2V0KCdodHRwOi8vYXBpLmV4YW1wbGU6ODA4MC9wcm9kdWN0cycpLnN1Y2Nlc3MoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5wcm9kdWN0cyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cbmltcG9ydCBNYWluQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuXG4vL2ltcG9ydCB7SW5qZWN0U2VydmVyfSBmcm9tICcuLi9hbmd1bGFyL3NlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHNjZVByb3ZpZGVyKSB7XG5cblxuICAgICRzY2VQcm92aWRlci5lbmFibGVkKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9NYWluJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvcHJvZHVjdHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IE1haW5DdHJsLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICB9KTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9Ub2RvJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvdG9kb3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRvZG9DdHJsLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICB9KTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9FcnJvcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2Vycm9yLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBFcnJvckN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgLy8kbG9jYXRpb25Qcm92aWRlci5oYXNoUHJlZml4KCchISEnKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLm90aGVyd2lzZSgnL01haW4nKTtcblxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcblxufTsiXX0=
