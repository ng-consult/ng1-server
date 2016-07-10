import ErrorCtrl from './controllers/Error';
import MainCtrl  from './controllers/Main';
import TodoCtrl  from './controllers/Todo';
import Routes from './routes';
import ProductList from './directives/ProductList';

// dream
//import { AngularClient } from './client';


var moduleName='myApp';

window[moduleName] = angular
                        .module(moduleName, ['ngResource', 'ngRoute'/*, 'angular-cache'*/])
                        .config(Routes)
                        .controller('MainCtrl', MainCtrl)
                        .controller('TodoCtrl', TodoCtrl)
                        .controller('ErrorCtrl', ErrorCtrl)
                        .directive('productList',ProductList);



window[moduleName].config(function() {
    window[moduleName].requires.push('angular-cache');
});


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

/** Dream

if ( typeof window.onServer === 'undefined') {
    AngularClient(angular, document, 100);
}
 */
