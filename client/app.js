import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';
import ProductList from './directives/ProductList';

/*
    this example runs with the API calls cache turned on with:
    angular.js-server-ng-cache
    see https://github.com/a-lucas/angular.js-server-ng-cache
*/

window['myApp'] = angular.module('myApp', ['ngResource', 'ngRoute', 'server', 'server-cache'])
    .config(Routes)
    .controller('MainCtrl', MainCtrl)
    .controller('TodoCtrl', TodoCtrl)
    .controller('ErrorCtrl', ErrorCtrl)
    .directive('productList', ProductList)
    .config(function($log) {
            $log.log('This should be written in log');
            $log.warn('This should be written in warn');
            $log.error('This should be written in error');
            $log.debug('This should be written in debug');
            $log.info('This should be written in info');
    });
