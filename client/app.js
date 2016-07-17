import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';
import ProductList from './directives/ProductList';
import {$CacheFactoryProvider, $TemplateCacheProvider} from './provider/ngCacheFactory';


// dream
//import { AngularClient } from './client';


var moduleName='myApp';

window[moduleName] = angular
                        .module(moduleName, ['ngResource', 'ngRoute'])
                        .config(Routes)
                        .controller('MainCtrl', MainCtrl)
                        .controller('TodoCtrl', TodoCtrl)
                        .controller('ErrorCtrl', ErrorCtrl)
                        .provider('$cacheFactory', $CacheFactoryProvider)
                        .provider('$templateCache', $TemplateCacheProvider)
                        .directive('productList', ProductList);

console.log('URL = ', window.location.href);

window[moduleName].config(function($windowProvider, $httpProvider, $cacheFactoryProvider, $templateCacheProvider) {

    $httpProvider.defaults.cache = true;

    var $window = $windowProvider.$get();

    if ($window.onServer && $window.onServer === true) {
        $window.$cacheFactoryProvider = $cacheFactoryProvider;
    }

    if (typeof $window.onServer === 'undefined' &&  typeof $window.$angularServerCache !== 'undefined' ) {
        console.log('SHOULD LOAD CACHE !');

        $cacheFactoryProvider.importAll($window.$angularServerCache);

        $window.addEventListener('StackQueueEmpty', function() {
            console.log('clearing cache now')
            $cacheFactoryProvider.remove('$http');
            $httpProvider.defaults.cache = true;
        });
    }


});
/*

window[moduleName].config(function( $httpProvider, $CacheFactoryProvider, $TemplateCacheProvider, $ServerCacheProvider) {

    console.log('MyCacheProvider', $CacheFactoryProvider);
    console.log('$TemplateCacheProvider', $TemplateCacheProvider);
    console.log('$ServerCacheProvider', $ServerCacheProvider);

    var cacheFactory = $CacheFactoryProvider.$get;

    console.log('cacheFactory', cacheFactory);

    var serverCache = cacheFactory('server');

    console.log('serverCache = ', serverCache);

    $httpProvider.defaults.cache = serverCache;


    function interceptHttp( $q ) {
        return({
            request: request,
            requestError: requestError,
            response: response,
            responseError: responseError
        });

        function request( config ) {
            console.log('Stating request', config);
            if (!config.cache) {
                config.cache = serverCache;
            }
            return( config );
        }

        function requestError( rejection ) {
            return( $q.reject( rejection ) );
        }

        function response( response ) {
            console.log('getting response', response);

            if (typeof response.config.cache !== 'undefined') {
                var cache = response.config.cache;
                console.log(cache.info());
            } else {
                console.log('No cache object');
            }
            return( response );
        }

        function responseError( response ) {
            return( $q.reject( response ) );
        }
    }

    $httpProvider.interceptors.push( interceptHttp );

});
*/
/*
window[moduleName].config(function( $injector, $httpProvider, $cacheFactoryProvider) {


    var myInjector = angular.injector(['ng']);
    //console.log('myInjector = ', myInjector);

    var cacheFactory = $cacheFactoryProvider.$get;
    //console.log(cacheFactory);

    var serverCache = cacheFactory('server');

    var keys = {};

    var addKey = function(key) {

    };

    function interceptHttp( $q ) {
        return({
            request: request,
            requestError: requestError,
            response: response,
            responseError: responseError
        });

        function request( config ) {
            //console.log('Stating request', config);
            if (!config.cache) {
                config.cache = serverCache;
            }
            return( config );
        }

        function requestError( rejection ) {
            return( $q.reject( rejection ) );
        }

        function response( response ) {
            //console.log('getting response', response);

            if (typeof response.config.cache !== 'undefined') {
                var cache = response.config.cache;
                //console.log(cache.info());
            }
            return( response );
        }

        function responseError( response ) {
            return( $q.reject( response ) );
        }
    }

    $httpProvider.interceptors.push( interceptHttp );
});

*/
/** Dream

if ( typeof window.onServer === 'undefined') {
    AngularClient(angular, document, 100);
}
 */
