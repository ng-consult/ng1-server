/**
 * Created by antoine on 07/07/16.
 */

var cacheEngine = require('./CacheEngine');
var Q = require('q');
var jsdom = require('jsdom');
var configValidation = require('./configValidation');
var debug = require('debug')('angular.js-server');

var AngularServerRenderer = function(config) {

    var valid = configValidation(config);
    if (valid.errors.length !== 0) {
        debug('invalid config = ', valid);
        console.log('invalid config');
        console.error(valid.errors);
        throw 'invalid config';
    }

    var cache = new cacheEngine(config);

    var shouldRender = function(url) {
        var i,regex;
        switch (config.render.strategy) {
            case 'none':
                return false;
            case 'all':
                return true;
            case 'include':
                for (i in config.render.rules) {
                    regex = config.render.rules[i];
                    if(regex.test(url)) {
                        return true;
                    }
                }
                return false;
            case 'exclude':
                for (i in config.render.rules) {
                    regex = config.render.rules[i];
                    if(regex.test(url)) {
                        return false;
                    }
                }
                return true;
        }
    };

    var getHTML = function(window, timeouts) {
        debug('Getting HTML.');
        var AngularDocument = window.angular.element(window.document);

        //debug('AngularDocument = ', window['myApp']);
        //debug('angular injetor cache: ', window.angular.injector);
        //debug('angular injetor cache: ', window.angular.injector.get('cacheFactory'));

        var scope = AngularDocument.scope();

        scope.$apply();
        for (var i in timeouts) {
            clearTimeout( timeouts[i]);
        }
        var html = window.document.documentElement.outerHTML;

        debug('$cacheFactoryProvider', window.$cacheFactoryProvider);

        if (typeof window.$cacheFactoryProvider !== 'undefined') {
            var cachedData = window.$cacheFactoryProvider.exportAll();

            var script = "<script type='text/javascript'> " +
                "//No read only needed " +
                "//Object.defineProperty (window,'$angularServerCache', {value :  " + JSON.stringify(cachedData)  + ",writable: false});"
                + "window.$angularServerCache = " + JSON.stringify(cachedData) + ";</script></head>";
            debug('inserting the script: ',script);

            var html = html.replace(/<\/head>/i, script);

        }

        debug('returned HTML length: ', html.length);
        return html;
    };
    
    this.middleware = (function(self) {

        return function(req, res, next) {
            debug('MiddleWare called with URL ', req.url);

            if (req.method !== 'GET') {
                next();
            }
            if (req.xhr === true) {
                next();
            }
            if( /text\/html/.test(req.get('accept')) !== true) {
                next();
            }

            var send = res.send.bind(res);

            res.send = function (body) {
                if(typeof body === 'string') {
                    self.render(body, req.url).then(function(result) {
                        debug('MiddleWare successfully rendered');
                        res.location(req.url);
                        res.status(200);
                        return send.apply(this, [result]);
                    }).fail(function(err) {
                        debug('MidleWare error rendering');
                        res.status(500);
                        res.location(req.url);
                        return send.apply(this,[err]);
                    });
                } else {
                    return send.apply(this, [body]);
                }
            };

            next();
            
        };
    })(this);

    this.render = function(html, url) {

        var defer = Q.defer();

        if (shouldRender(url) === false) {
            debug('This Angular URL should not be pre-rendered', url);
            defer.resolve( html );
        } else {
            var cacheUrl = cache.loadUrl(html, url);
            if (cacheUrl.isCached()) {
                debug('This URL is cached', url);
                defer.resolve(cacheUrl.getCached());
            } else {

                jsdom.debugMode = true;

                var rendering = false;

                var document  = jsdom.jsdom(html, {
                    features: {
                        FetchExternalResources: ['script'],
                        ProcessExternalResources: ['script']
                    },
                    url: 'http://' + config.server.domain + ':' + config.server.port + url,
                    virtualConsole: jsdom.createVirtualConsole().sendTo(console),
                    document: {
                        referer: '',
                        cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
                        cookieDomain: config.server.domain
                    }
                });

                var window = document.defaultView;
                window.onServer = true;
                debug('SERVER myApp = ', window['myApp']);


                var serverTimeout = setTimeout(function () {
                    if (rendering) return;
                    debug('SERVER TIMEOUT ! ! !');
                    //@todo Get the error URl here
                    rendering = true;
                    var html = getHTML(window, [serverTimeout]);
                    cacheUrl.removeCache();
                    defer.resolve(html);
                    window.close();
                    window.dispose();
                }, config.server.timeout);


                window.addEventListener('error', function (err) {
                    cacheUrl.removeCache();
                    debug('EVENT LISTENER ON ERROR CATCHED', err);
                    defer.reject(err);
                    window.close();
                    window.dispose();
                });
/* OLD
                window.addEventListener('AngularContextException', function (e) {
                    rendering = true;
                    StackTrace.get()
                        .then(function (stack) {
                            console.log('StackTrace.get', stack);
                        })
                        .catch(function (err) {
                            console.log('StackTrace.catch', err);
                        });
                    cacheUrl.removeCache();
                    debug("AngularContextException caught on server");
                    window.console.error(e);
                    defer.reject(err);
                    window.close();
                    window.dispose();
                });
*/
                window.addEventListener('StackQueueEmpty', function () {
                    debug('StackQueueEmpty event caught');
                    if (rendering) return;
                    rendering = true;
                    var html = getHTML(window, [serverTimeout]);
                    cacheUrl.cacheIt(html);
                    defer.resolve(html);
                    window.close();
                    window.dispose();
                });


                window.addEventListener('load', function() {
                    debug('Application is loaded in JSDOM');
                    debug('LISTING ALL EVENT LISTENERS')
                    var i=0;
                    Event.observers.each(function(item) {
                        debug(i + '-------============--------');
                        debug(item);
                    });
                    debug('IS Angular bootstrapped?');

                    var originalBootstrap = window.angular.bootstrap;

                    window.angular.bootstrap = function() {
                        debug('Starting Angular');
                        originalBootstrap.apply(this, arguments);
                        debug('Angular started');
                    };
                });

                var afterAngularStarted = function() {
                    var windowApp = window[config.name];
                    windowApp.config(function($provide) {
                        $provide.decorator('$exceptionHandler', function($exceptionHandler) {
                            return function(error, cause) {
                                debug('Throwing error = ', error);
                                debug('cause', cause);
                                $exceptionHandler(error, cause);
                                throw error;
                            };
                        });
                    });
                }
            }
        }

        return defer.promise;
    };

};

module.exports = AngularServerRenderer;
