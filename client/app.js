import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';
import ProductList from './directives/ProductList';

/*
    this example runs with the API calls cache turne on with:
    angular.js-server-ng-cache
    see https://github.com/a-lucas/angular.js-server-ng-cache
    
*/
window['myApp'] = angular.module('myApp', ['ngResource', 'ngRoute', 'server-cache'])
    .config(Routes)
    .controller('MainCtrl', MainCtrl)
    .controller('TodoCtrl', TodoCtrl)
    .controller('ErrorCtrl', ErrorCtrl)
    .directive('productList', ProductList)
    .config(function($windowProvider) {
        var $window = $windowProvider.$get();
        var event = new Event('angularInConfig');
        $window.dispatchEvent(event);
    });
