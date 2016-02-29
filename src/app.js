import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';
import ProductList from './directives/ProductList';

// dream
//import { AngularClient } from './client';


var moduleName='myApp';

window[moduleName] = angular
                        .module(moduleName, ['ngResource', 'ngRoute'])
                        .config(Routes)
                        .controller('MainCtrl', MainCtrl)
                        .controller('TodoCtrl', TodoCtrl)
                        .controller('ErrorCtrl', ErrorCtrl)
                        .directive('productList',ProductList);


/** Dream

if ( typeof window.onServer === 'undefined') {
    AngularClient(angular, document, 100);
}
 */
