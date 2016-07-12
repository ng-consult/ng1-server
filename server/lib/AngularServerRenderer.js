/**
 * Created by antoine on 07/07/16.
 */

var cacheEngine = require('./CacheEngine');
var Q = require('q');
var jsdom = require('jsdom');
var configValidation = require('./configValidation');

var AngularServerRenderer = function(config) {

    var valid = configValidation(config);
    if (valid.errors.length !== 0) {
        console.log('valid config = ', valid);
        throw 'invalid config';
    }

    var cache = new cacheEngine(config);

    this.generateDoc = function(html) {
        return '<html><head><base href="/"/></head><body>'+html+'</body></html>';
    };

    var shouldRender = function(url) {
        switch (config.render.strategy) {
            case 'none':
                return false;
            case 'all':
                return true;
            case 'include':
                var i,regex;
                for (i in config.render.rules) {
                    regex = config.render.rules[i];
                    if(regex.test(url)) {
                        return true;
                    }
                }
                return false;
            case 'exclude':
                var i,regex;
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

        var AngularDocument = window.angular.element(window.document);
        var scope = AngularDocument.scope()
        scope.$apply();
        for (var i in timeouts) {
            clearTimeout( timeouts[i]);
        }

        return window.document.documentElement.outerHTML;
    };

    this.render = function(html, url) {

        var defer = Q.defer();

        if (shouldRender(url) === false) {
            console.log('No rendering for this URL');
            defer.resolve( html );
        } else {
            var cacheUrl = cache.loadUrl(html, url);
            if (cacheUrl.isCached()) {
                console.log('THIS Url is cached: bingo!');
                defer.resolve(cacheUrl.getCached());
            } else {

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

                var serverTimeout = setTimeout(function () {
                    if (rendering) return;
                    console.error('SERVER TIMEOUT ! ! !');
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
                    console.log('EVENT LISTENER ON ERROR CATCHED', err);
                    defer.reject(err);
                    window.close();
                    window.dispose();
                });

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
                    window.console.error("AngularContextException caught on server");
                    window.console.error(e);
                    window.close();
                    window.dispose();
                    defer.reject(err);
                });

                window.addEventListener('StackQueueEmpty', function () {
                    if (rendering) return;
                    rendering = true;
                    var html = getHTML(window, [serverTimeout]);
                    cacheUrl.cacheIt(html);
                    defer.resolve(html);
                    window.close();
                    window.dispose();
                });

                window.addEventListener('load', function() {
                    var angularApp = window.angular.bootstrap(window.document, [config.name]);
                });

            }
        }

        return defer.promise;
    };

};

module.exports = AngularServerRenderer;
