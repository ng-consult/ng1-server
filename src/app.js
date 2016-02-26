import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';

import { AngularClient } from './client';
import ProductList from './directives/ProductList';

var moduleName='myApp';

window[moduleName] = angular
                        .module(moduleName, ['ngResource', 'ngRoute'])
                        .config(Routes)
                        .controller('MainCtrl', MainCtrl)
                        .controller('TodoCtrl', TodoCtrl)
                        .controller('ErrorCtrl', ErrorCtrl)
                        .directive('productList',ProductList);



if ( typeof window.onServer === 'undefined') {
    AngularClient(angular, document, 100);
}
