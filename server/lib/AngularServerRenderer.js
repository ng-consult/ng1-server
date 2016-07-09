/**
 * Created by antoine on 07/07/16.
 */

var angularDomJs = require('./AngularDomJs');
var cacheEngine = require('./CacheEngine');
var Q = require('q');
var jsdom = require('jsdom');

var AngularServerRenderer = function(config) {

    var cache = new cacheEngine(config);

    this.generateDoc = function(html) {
        return '<html id="'+config.name+'"><head><base href="/"/></head><body>'+html+'</body></html>';
    }

    this.render = function(html, url) {
        var defer = Q.defer();
        var cacheUrl = cache.loadUrl(html, url);
        if( cacheUrl.isCached()) {
            defer.resolve( cacheUrl.getCached() );
        } else {
            var angularDom = new angularDomJs(config);
            var c_window = angularDom.c_window;

            c_window.cacheUrl = cacheUrl;
            var jsDomConfig = {
                html: this.generateDoc(html),
                src: angularDom.getClientJS(),
                features: {
                    FetchExternalResources :  false,
                    ProcessExternalResources:  false
                },
                url: 'http://' + config.server.domain +':' + config.server.port +  url,
                virtualConsole: jsdom.createVirtualConsole().sendTo(c_window.console),
                created: function (err, window) {
                    if (err) {
                        c_window.cacheEngine.removeCache();
                        c_window.console.error('ERR CATCHED IN CREATED', err);
                        defer.reject(err);
                        return;
                    }
                    window.scrollTo = function () {};
                    window.onServer = true;
                    window.appName = config.name;

                    window.addEventListener('error', function(err) {
                        c_window.cacheUrl.removeCache();
                        c_window.console.log('EVENT LISTENER ON ERROR CATCHED', err);
                        defer.reject(err);
                    });
                },
                done: function (err, window) {
                    if (err) {
                        //@todo manually write inside serverConfig.logFiles.error.path
                        c_window.cacheUrl.removeCache();
                        c_window.console.error('ERR CATCHED IN DONE', err);
                        angularDom.closeSession(window);
                        defer.reject(err);
                        return;
                    }

                    c_window.window = Object.assign(c_window.window, window);


                    var angularApp = c_window.angular.bootstrap(c_window.document, [ config.name ]);

                    //var $log = angularApp.invoke( function($log) {return $log;} );
                    var $window = angularApp.invoke( function($window) {return $window;});

                    var rendering = false;


                    /* Get rid of the exception Handler issue
                     * https://github.com/angular/zone.js/issues/29
                     * */
                    /*
                     module.config(function($provide) {
                     $provide.decorator('$exceptionHandler', function($exceptionHandler) {
                     return function(error, cause) {
                     $exceptionHandler(error, cause);
                     throw error;
                     };
                     });
                     });*/
                    $window.addEventListener('AngularContextException', function(e) {
                        rendering = true;
                        StackTrace.get()
                            .then(function(stack){
                                c_window.console.log('StackTrace.get', stack);
                            })
                            .catch(function(err){
                                c_window.console.log('StackTrace.catch', err);
                            });
                        c_window.cacheUrl.removeCache();
                        c_window.console.error("AngularContextException caught on server");
                        c_window.console.error(e);
                        defer.reject(err);
                        angularDom.closeSession(window);
                    });

                    $window.addEventListener('StackQueueEmpty', function () {
                        c_window.console.log('StackQueueEmpty event caught !');
                        if (rendering) return;
                        rendering = true;
                        var html = angularDom.getHTML([ serverTimeout ]);
                        c_window.cacheUrl.cacheIt(html);
                        angularDom.closeSession(window);
                        c_window.console.log('server done');
                        defer.resolve(html);
                    });

                    var serverTimeout = setTimeout(function() {
                        if (rendering) return;
                        c_window.console.error('SERVER TIMEOUT ! ! !');
                        //@todo Get the error URl here
                        rendering = true;
                        var html = angularDom.getHTML( [ serverTimeout ]);
                        angularDom.closeSession( window);
                        c_window.cacheUrl.removeCache();
                        defer.resolve( html );
                    }, config.server.timeout);


                },
                document: {
                    referer: '',
                    cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
                    cookieDomain: config.server.domain
                }
            };


            jsdom.debugMode = false;
            jsdom.env(jsDomConfig);
        }

        return defer.promise;
    };

};

module.exports = AngularServerRenderer;
