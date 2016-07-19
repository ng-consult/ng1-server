var ngCacheFactory = require('./provider/ngCacheFactory');
var debug = require('debug')('angular.js-server');


module.exports =  function AngularServerDecorator( _window, module ) {

    debug('AngularServerDecorator called', module);
    module.provider('$cacheFactory', ngCacheFactory.$CacheFactoryProvider);
    module.provider('$templateCache', ngCacheFactory.$TemplateCacheProvider);

    debug('Assigning Windows');
    window = Object.assign(_window, window);
    debug(window);

    return module.config(function($windowProvider, $httpProvider, $cacheFactoryProvider) {

        $httpProvider.defaults.cache = true;

        var $window = $windowProvider.$get();

        if ($window.onServer && $window.onServer === true) {
            $window.$cacheFactoryProvider = $cacheFactoryProvider;
        }

        if (typeof $window.onServer === 'undefined' &&  typeof $window.$angularServerCache !== 'undefined') {

            $cacheFactoryProvider.importAll($window.$angularServerCache);

            $window.addEventListener('StackQueueEmpty', function() {
                $cacheFactoryProvider.remove('$http');
                $httpProvider.defaults.cache = true;
            });
        }

    });
};