import {$CacheFactoryProvider, $TemplateCacheProvider} from './provider/ngCacheFactory';


// .provider('$cacheFactory', $CacheFactoryProvider)
// .provider('$templateCache', $TemplateCacheProvider)

export default function AngularServerDecorator( _window, module ) {

    module.provider('$cacheFactory', $CacheFactoryProvider);
    module.provider('$templateCache', $TemplateCacheProvider);

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

    };
};