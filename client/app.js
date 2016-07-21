import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';
import ProductList from './directives/ProductList';


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
