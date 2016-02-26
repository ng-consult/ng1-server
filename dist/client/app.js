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

var _client = require('./client');

var _ProductList = require('./directives/ProductList');

var _ProductList2 = _interopRequireDefault(_ProductList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moduleName = 'myApp';

window[moduleName] = angular.module(moduleName, ['ngResource', 'ngRoute']).config(_routes2.default).controller('MainCtrl', _Main2.default).controller('TodoCtrl', _Todo2.default).controller('ErrorCtrl', _Error2.default).directive('productList', _ProductList2.default);

if (typeof window.onServer === 'undefined') {
                        (0, _client.AngularClient)(angular, document, 100);
}

},{"./client":2,"./controllers/Error":3,"./controllers/Main":4,"./controllers/Todo":5,"./directives/ProductList":6,"./routes":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by antoine on 17/02/16.
 */

var AngularClient = exports.AngularClient = function AngularClient(angular, document, timeout) {
    var x = document.head.getElementsByTagName("style");
    for (var i = x.length - 1; i >= 0; i--) {
        x[i].parentElement.removeChild(x[i]);
    }

    // empty the prerender div
    var view = document.getElementById('prerendered');
    if (view) {
        view.innerHTML = '';
    } else {
        var view = '<div id="prerendered"></div>';
        document.body.appendChild(view);
    }

    var html = angular.element(document.getElementById('myApp'));

    // Should register within EngineQueue
    setTimeout(function () {
        angular.bootstrap(html, ['myApp']);
    }, timeout);
};

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function ($http) {
    return {
        restrict: 'E',
        replace: true,
        transclude: false,
        //scope: { products: { data: [ { name: 'test', price: 1 }] } },
        template: '<li ng-repeat="product in products">{{product.name}} {{product.price}}</li>',
        link: function link(scope, element, attrs) {

            $http.get('/products').success(function (data) {
                //console.log(data);
                scope.products = data;
            });
        }
    };
};

;

},{}],7:[function(require,module,exports){
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

},{"./controllers/Error":3,"./controllers/Main":4,"./controllers/Todo":5}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NsaWVudC5qcyIsInNyYy9jb250cm9sbGVycy9FcnJvci5qcyIsInNyYy9jb250cm9sbGVycy9NYWluLmpzIiwic3JjL2NvbnRyb2xsZXJzL1RvZG8uanMiLCJzcmMvZGlyZWN0aXZlcy9Qcm9kdWN0TGlzdC5qcyIsInNyYy9yb3V0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1FBLElBQUksYUFBVyxPQUFYOztBQUVKLE9BQU8sVUFBUCxJQUFxQixRQUNJLE1BREosQ0FDVyxVQURYLEVBQ3VCLENBQUMsWUFBRCxFQUFlLFNBQWYsQ0FEdkIsRUFFSSxNQUZKLG1CQUdJLFVBSEosQ0FHZSxVQUhmLGtCQUlJLFVBSkosQ0FJZSxVQUpmLGtCQUtJLFVBTEosQ0FLZSxXQUxmLG1CQU1JLFNBTkosQ0FNYyxhQU5kLHdCQUFyQjs7QUFVQSxJQUFLLE9BQU8sT0FBTyxRQUFQLEtBQW9CLFdBQTNCLEVBQXdDO0FBQ3pDLG1EQUFjLE9BQWQsRUFBdUIsUUFBdkIsRUFBaUMsR0FBakMsRUFEeUM7Q0FBN0M7Ozs7Ozs7Ozs7OztBQ2ZPLElBQU0sd0NBQWdCLFNBQWhCLGFBQWdCLENBQUMsT0FBRCxFQUFVLFFBQVYsRUFBb0IsT0FBcEIsRUFBZ0M7QUFDekQsUUFBSSxJQUFJLFNBQVMsSUFBVCxDQUFjLG9CQUFkLENBQW1DLE9BQW5DLENBQUosQ0FEcUQ7QUFFekQsU0FBSyxJQUFJLElBQUksRUFBRSxNQUFGLEdBQVcsQ0FBWCxFQUFjLEtBQUssQ0FBTCxFQUFRLEdBQW5DLEVBQXdDO0FBQ3BDLFVBQUUsQ0FBRixFQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FBK0IsRUFBRSxDQUFGLENBQS9CLEVBRG9DO0tBQXhDOzs7QUFGeUQsUUFPckQsT0FBTyxTQUFTLGNB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QXZCLENBQStCLFVBQVUsSUFBVixFQUFnQjs7QUFFM0Msc0JBQU0sUUFBTixHQUFpQixJQUFqQixDQUYyQzthQUFoQixDQUEvQixDQUZtQztTQUFqQztLQU5WLENBRDJCO0NBQWhCOztBQWVkOzs7Ozs7Ozs7a0JDTmMsVUFBUyxjQUFULEVBQXlCLGlCQUF6QixFQUE0QyxZQUE1QyxFQUEwRDs7QUFHckUsaUJBQWEsT0FBYixDQUFxQixLQUFyQixFQUhxRTs7QUFLckUsbUJBQWUsSUFBZixDQUFvQixPQUFwQixFQUE2QjtBQUN6QixxQkFBYSx1QkFBYjtBQUNBLGtDQUZ5QjtBQUd6QixzQkFBYyxJQUFkO0tBSEosRUFMcUU7O0FBV3JFLG1CQUFlLElBQWYsQ0FBb0IsT0FBcEIsRUFBNkI7QUFDekIscUJBQWEsb0JBQWI7QUFDQSxrQ0FGeUI7QUFHekIsc0JBQWMsSUFBZDtLQUhKLEVBWHFFOztBQWlCckUsbUJBQWUsSUFBZixDQUFvQixRQUFwQixFQUE4QjtBQUMxQixxQkFBYSxvQkFBYjtBQUNBLG1DQUYwQjtBQUcxQixzQkFBYyxJQUFkO0tBSEosRUFqQnFFOztBQXVCckUsbUJBQWUsU0FBZixDQUF5QixPQUF6QixFQXZCcUU7O0FBMEJyRSxzQkFBa0IsU0FBbEIsQ0FBNEIsSUFBNUIsRUExQnFFO0NBQTFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJkIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBFcnJvckN0cmwgZnJvbSAnLi9jb250cm9sbGVycy9FcnJvcic7XG5pbXBvcnQgTWFpbkN0cmwgIGZyb20gJy4vY29udHJvbGxlcnMvTWFpbic7XG5pbXBvcnQgVG9kb0N0cmwgIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgUm91dGVzIGZyb20gJy4vcm91dGVzJztcblxuaW1wb3J0IHsgQW5ndWxhckNsaWVudCB9IGZyb20gJy4vY2xpZW50JztcbmltcG9ydCBQcm9kdWN0TGlzdCBmcm9tICcuL2RpcmVjdGl2ZXMvUHJvZHVjdExpc3QnO1xuXG52YXIgbW9kdWxlTmFtZT0nbXlBcHAnO1xuXG53aW5kb3dbbW9kdWxlTmFtZV0gPSBhbmd1bGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAubW9kdWxlKG1vZHVsZU5hbWUsIFsnbmdSZXNvdXJjZScsICduZ1JvdXRlJ10pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29uZmlnKFJvdXRlcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jb250cm9sbGVyKCdNYWluQ3RybCcsIE1haW5DdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNvbnRyb2xsZXIoJ1RvZG9DdHJsJywgVG9kb0N0cmwpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY29udHJvbGxlcignRXJyb3JDdHJsJywgRXJyb3JDdHJsKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRpcmVjdGl2ZSgncHJvZHVjdExpc3QnLFByb2R1Y3RMaXN0KTtcblxuXG5cbmlmICggdHlwZW9mIHdpbmRvdy5vblNlcnZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBBbmd1bGFyQ2xpZW50KGFuZ3VsYXIsIGRvY3VtZW50LCAxMDApO1xufVxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gMTcvMDIvMTYuXG4gKi9cblxuXG5leHBvcnQgY29uc3QgQW5ndWxhckNsaWVudCA9IChhbmd1bGFyLCBkb2N1bWVudCwgdGltZW91dCkgPT4ge1xuICAgIHZhciB4ID0gZG9jdW1lbnQuaGVhZC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN0eWxlXCIpO1xuICAgIGZvciAodmFyIGkgPSB4Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHhbaV0ucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh4W2ldKTtcbiAgICB9XG5cbi8vIGVtcHR5IHRoZSBwcmVyZW5kZXIgZGl2XG4gICAgdmFyIHZpZXcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJlcmVuZGVyZWQnKTtcbiAgICBpZiAodmlldykge1xuICAgICAgICB2aWV3LmlubmVySFRNTCA9ICcnO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHZpZXcgPSAnPGRpdiBpZD1cInByZXJlbmRlcmVkXCI+PC9kaXY+JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2aWV3KTtcbiAgICB9XG5cbiAgICB2YXIgaHRtbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXlBcHAnKSk7XG5cbiAgICAvLyBTaG91bGQgcmVnaXN0ZXIgd2l0aGluIEVuZ2luZVF1ZXVlXG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGh0bWwsIFsnbXlBcHAnXSk7XG4gICAgfSwgdGltZW91dCk7XG5cbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDE3LzAyLzE2LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvckN0cmwge1xuXG4gICAgY29uc3RydWN0b3IoJGxvZykge1xuXG4gICAgICAgIGNvbnN0IGVycm9yMSA9ICdDYXRjaGFibGUgRXJyb3IoKSc7XG4gICAgICAgIGNvbnN0IGVycm9yMiA9ICdDYXRjaGFibGUgRXhjZXB0aW9uKCknO1xuICAgICAgICBjb25zdCBlcnJvcjMgPSAnVW5jYXRjaGFibGUgRXJyb3IoKSAtIHNob3VsZCBjcmFzaCB0aGUgYXBwLic7XG5cbiAgICAgICAgJGxvZy5sb2coJ1dpbGwuLi4uJyArIGVycm9yMSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcihlcnJvcjEpXG4gICAgICAgIH0gY2F0Y2ggKGUxKSB7XG4gICAgICAgICAgICAkbG9nLmxvZygnSSBjYXRjaGVkIGFuIEVycm9yL0V4Y2VwdGlvbjogJyArIGUxICk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjIpO1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFeGNlcHRpb24oZXJyb3IyKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUyKSB7XG4gICAgICAgICAgICAgICAgJGxvZy5sb2coJ0kgY2F0Y2hlZCBhbiBFcnJvci9FeGNlcHRpb246ICcgKyBlMiApO1xuICAgICAgICAgICAgICAgICRsb2cubG9nKCdXaWxsLi4uLicgKyBlcnJvcjMpO1xuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFeGNlcHRpb24oZXJyb3IzKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3dFcnJvciA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0ZXh0KTtcbiAgICB9O1xuXG4gICAgdGhyb3dFeGNlcHRpb24gPSAodGV4dCkgPT4ge1xuICAgICAgICB0aHJvdyB0ZXh0O1xuICAgIH07XG5cbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgYW50b2luZSBvbiA5LzAyLzE2LlxuICovXG5cbmNsYXNzIE1haW5DdHJsIHtcbiAgICBjb25zdHJ1Y3RvcigkbG9nKXtcblxuICAgICAgICAkbG9nLmxvZygnSSBhbSBhIGxvZycsICd3aXRoIHR3byBwYXJhbWV0ZXJzJyk7XG4gICAgICAgICRsb2cud2FybignSSBhbSBhIHdhcm4nKTtcbiAgICAgICAgJGxvZy5pbmZvKCdJIGFtIGFuIGluZm8nKTtcbiAgICAgICAgLyokbG9nLmVycm9yKCdJIGFtIGVycm9yIHdpdGggYW4gb2JqZWN0Jywge1xuICAgICAgICAgICAgbmFtZTogJ3ZhbHVlJ1xuICAgICAgICB9KTsqL1xuXG5cbiAgICB9XG5cbiAgICB0aXRsZSA9ICdBbmd1bGFyIEVzNiByZXZpc2l0ZWQnO1xufVxuZXhwb3J0IGRlZmF1bHQgTWFpbkN0cmw7IiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFudG9pbmUgb24gOS8wMi8xNi5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2RvQ3RybCB7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICBjb25zb2xlLmxvZygnVG9kb0N0cmwgTG9hZGVkJywgdGhpcyk7XG4gICAgfVxuXG4gICAgYWRkVG9kbyA9ICgpID0+IHtcbiAgICAgICAgdGhpcy50b2Rvcy5wdXNoKHt0ZXh0OnRoaXMudG9kb1RleHQsIGRvbmU6ZmFsc2V9KTtcbiAgICAgICAgdGhpcy50b2RvVGV4dCA9ICcnO1xuICAgIH07XG5cblxuICAgIHRpdGxlID0gXCJUb2RvcyB0aXRsZVwiO1xuXG4gICAgdG9kb3MgPSBbXG4gICAgICAgIHt0ZXh0OidsZWFybiBhbmd1bGFyJywgZG9uZTp0cnVlfSxcbiAgICAgICAge3RleHQ6J2J1aWxkIGFuIGFuZ3VsYXIgYXBwJywgZG9uZTpmYWxzZX1dO1xuXG4gICAgdG9kb1RleHQgPSAnJztcblxuXG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oJGh0dHApIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0cmFuc2NsdWRlOiBmYWxzZSxcbiAgICAgICAgLy9zY29wZTogeyBwcm9kdWN0czogeyBkYXRhOiBbIHsgbmFtZTogJ3Rlc3QnLCBwcmljZTogMSB9XSB9IH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGxpIG5nLXJlcGVhdD1cInByb2R1Y3QgaW4gcHJvZHVjdHNcIj57e3Byb2R1Y3QubmFtZX19IHt7cHJvZHVjdC5wcmljZX19PC9saT4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG5cbiAgICAgICAgICAgICRodHRwLmdldCgnL3Byb2R1Y3RzJykuc3VjY2VzcyhmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICAgICAgc2NvcGUucHJvZHVjdHMgPSBkYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhbnRvaW5lIG9uIDkvMDIvMTYuXG4gKi9cbmltcG9ydCBNYWluQ3RybCBmcm9tICcuL2NvbnRyb2xsZXJzL01haW4nO1xuaW1wb3J0IFRvZG9DdHJsIGZyb20gJy4vY29udHJvbGxlcnMvVG9kbyc7XG5pbXBvcnQgRXJyb3JDdHJsIGZyb20gJy4vY29udHJvbGxlcnMvRXJyb3InO1xuXG4vL2ltcG9ydCB7SW5qZWN0U2VydmVyfSBmcm9tICcuLi9hbmd1bGFyL3NlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHNjZVByb3ZpZGVyKSB7XG5cblxuICAgICRzY2VQcm92aWRlci5lbmFibGVkKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9NYWluJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvcHJvZHVjdHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IE1haW5DdHJsLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICB9KTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9Ub2RvJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJy4vdmlld3MvdG9kb3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6IFRvZG9DdHJsLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcbiAgICB9KTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9FcnJvcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdzL2Vycm9yLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiBFcnJvckN0cmwsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xuICAgIH0pO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKCcvTWFpbicpO1xuXG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG5cbn07Il19
