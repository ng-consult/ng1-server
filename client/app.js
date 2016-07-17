import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';
import ProductList from './directives/ProductList';
import {$CacheFactoryProvider, $TemplateCacheProvider} from './provider/ngCacheFactory';
import AngularServerDecorator from './AngularServerDecorator';


var mainApp = angular.module('myApp', ['ngResource', 'ngRoute'])
    .config(Routes)
    .controller('MainCtrl', MainCtrl)
    .controller('TodoCtrl', TodoCtrl)
    .controller('ErrorCtrl', ErrorCtrl)
    .directive('productList', ProductList);

console.log('URL = ', window.location.href);

AngularServerDecorator(mainApp);

/* old
app.config(function($windowProvider, $httpProvider, $cacheFactoryProvider) {

    $httpProvider.defaults.cache = true;

    var $window = $windowProvider.$get();

    if ($window.onServer && $window.onServer === true) {
        $window.$cacheFactoryProvider = $cacheFactoryProvider;
    }

    if (typeof $window.onServer === 'undefined' &&  typeof $window.$angularServerCache !== 'undefined' ) {

        $cacheFactoryProvider.importAll($window.$angularServerCache);

        $window.addEventListener('StackQueueEmpty', function() {
            $cacheFactoryProvider.remove('$http');
            $httpProvider.defaults.cache = true;
        });
    }

});*/