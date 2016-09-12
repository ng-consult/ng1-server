"use strict";
var CacheEngine_1 = require('./CacheEngine');
var Q = require('q');
var jsdom = require('jsdom');
var dbug = require('debug');
var fs = require('fs');
var debug = dbug('angular.js-server');
var AngularServerRenderer = (function () {
    function AngularServerRenderer(config) {
        var _this = this;
        this.config = config;
        this.middleware = function () {
            var self = _this;
            return function (req, res, next) {
                debug('MiddleWare called with URL ', req.url);
                if (req.method !== 'GET') {
                    next();
                }
                if (req.xhr === true) {
                    next();
                }
                if (/text\/html/.test(req.get('accept')) !== true) {
                    next();
                }
                var send = res.send.bind(res);
                res.send = function (body) {
                    if (typeof body === 'string') {
                        self.render(body, req.url).then(function (result) {
                            debug('MiddleWare successfully rendered');
                            res.location(req.url);
                            res.status(200);
                            return send.apply(this, [result]);
                        }).fail(function (err) {
                            debug('MidleWare error rendering');
                            res.status(500);
                            res.location(req.url);
                            return send.apply(this, [err]);
                        });
                    }
                    else {
                        return send.apply(this, [body]);
                    }
                };
                next();
            };
        };
        this.render = function (html, url) {
            var defer = Q.defer();
            if (_this.shouldRender(url) === false) {
                debug('This Angular URL should not be pre-rendered', url);
                defer.resolve(html);
            }
            else {
                var cacheUrl_1 = _this.cache.loadUrl(html, url);
                if (cacheUrl_1.isCached()) {
                    debug('This URL is cached', url);
                    defer.resolve(cacheUrl_1.getCached());
                }
                else {
                    jsdom.debugMode = true;
                    var rendering_1 = false;
                    debug('SERVER URL = ', 'http://' + _this.config.server.domain + ':' + _this.config.server.port + url);
                    var document_1 = jsdom.jsdom(html, {
                        features: {
                            FetchExternalResources: ['script'],
                            ProcessExternalResources: ['script']
                        },
                        url: 'http://' + _this.config.server.domain + ':' + _this.config.server.port + url,
                        virtualConsole: jsdom.createVirtualConsole().sendTo(console),
                        document: {
                            referrer: '',
                            cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
                            cookieDomain: _this.config.server.domain
                        }
                    });
                    var window_1 = Object.assign(document_1.defaultView, {
                        onServer: true,
                        fs: fs,
                        logConfig: _this.config.log
                    });
                    debug('jsdom.jsdom loaded');
                    var serverTimeout_1 = setTimeout(function () {
                        if (rendering_1)
                            return;
                        debug('SERVER TIMEOUT ! ! !');
                        rendering_1 = true;
                        var renderedHtml = _this.getHTML(window_1, [serverTimeout_1]);
                        cacheUrl_1.removeCache();
                        defer.resolve(renderedHtml);
                        window_1.close();
                    }, _this.config.server.timeout);
                    window_1.addEventListener('ServerExceptionHandler', function (err, data) {
                        rendering_1 = true;
                        cacheUrl_1.removeCache();
                        debug('EVENT LISTENER ON ServerExceptionHandler CATCHED', err.details);
                        defer.reject(err.details);
                        window_1.close();
                        window_1.dispose();
                    });
                    window_1.addEventListener('StackQueueEmpty', function () {
                        debug('StackQueueEmpty event caught');
                        if (rendering_1)
                            return;
                        rendering_1 = true;
                        var renderedHtml = _this.getHTML(window_1, [serverTimeout_1]);
                        cacheUrl_1.cacheIt(renderedHtml);
                        defer.resolve(renderedHtml);
                        window_1.close();
                        window_1.dispose();
                    });
                    window_1.addEventListener('load', function () {
                        debug('Application is loaded in JSDOM');
                    });
                }
            }
            return defer.promise;
        };
        this.cache = new CacheEngine_1["default"](this.config);
    }
    AngularServerRenderer.prototype.shouldRender = function (url) {
        var i, regex;
        switch (this.config.render.strategy) {
            case 'none':
                return false;
            case 'all':
                return true;
            case 'include':
                for (i in this.config.render.rules) {
                    regex = this.config.render.rules[i];
                    if (regex.test(url)) {
                        return true;
                    }
                }
                return false;
            case 'exclude':
                for (i in this.config.render.rules) {
                    regex = this.config.render.rules[i];
                    if (regex.test(url)) {
                        return false;
                    }
                }
                return true;
        }
    };
    ;
    AngularServerRenderer.prototype.getHTML = function (window, timeouts) {
        debug('Getting HTML.');
        var AngularDocument = window.angular.element(window.document);
        var scope = AngularDocument.scope();
        scope.$apply();
        for (var i in timeouts) {
            clearTimeout(timeouts[i]);
        }
        var html = window.document.documentElement.outerHTML;
        debug('$cacheFactoryProvider', window.$cacheFactoryProvider);
        if (typeof window.$cacheFactoryProvider !== 'undefined') {
            var cachedData = window.$cacheFactoryProvider.exportAll();
            var script = "<script type='text/javascript'> " +
                "/*No read only needed */" +
                "/*Object.defineProperty (window,'$angularServerCache', {value :  " + JSON.stringify(cachedData) + ",writable: false});*/"
                + "window.$angularServerCache = " + JSON.stringify(cachedData) + ";</script></head>";
            debug('inserting the script: ', script);
            html = html.replace(/<\/head>/i, script);
        }
        debug('returned HTML length: ', html.length);
        return html;
    };
    ;
    return AngularServerRenderer;
}());
;
module.exports = AngularServerRenderer;
//# sourceMappingURL=AngularServerRenderer.js.map