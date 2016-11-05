'use strict';
var q = require('q');
var phantom = require('phantom');
var tidy = require('./tidyHtml');
var debug = require('debug')('mocha-test-phantom');

var phInstance = null;

const startPhantomInstance = () => {
    var defer = q.defer();

    /*if (phInstance !== null) {
        //debug('PhantomJS instance already created');
        defer.resolve(phInstance);
    } else {*/
        phantom.create(/*[], { warn: phDebug, debug: phDebug, error: phDebug, info: phDebug, log:phDebug}*/).then(function (instance) {
            debug('PhantomJS never created, instanciating');
            phInstance = instance;
            phInstance.on('onError', function (err) {
                debug('Error caught on phantom instance', err);
                defer.reject(err);
            });
            defer.resolve(phInstance);
        });
    //}

    return defer.promise;
};

module.exports.jsDisabled = (url) => {

    let sitepage = null;

    const resultDefer = q.defer();
    const pjs = startPhantomInstance();

    pjs
        .then(function (instance) {
            debug('noJS pge created');
            return instance.createPage();
        })
        .then(function (page) {
            page.on('onClosing', false, function (data) {
                debug('onClosing noJS sitepage caught');
            });

            page.on('onError', false, function (err) {
                debug('noJS error caught', JSON.stringify(err));
                //done(JSON.stringify(err));
            });

            page.on('onLog', false, function (log) {
                debug('client noJS console.log', log);
            });

            sitepage = page;

            return page.setting('javascriptEnabled', false);
        })
        .then(function (what) {
            return sitepage.open(url);
        })
        .then(function (status) {
            if (status !== 'success') {
                throw new Error('status = ' + status);
            }
            return sitepage.property('content');
        })
        .then(function (html) {
            resultDefer.resolve(tidy(html.trim()));
            return sitepage.close();
        })
        .catch(function (err) {
            debug('Error', JSON.stringify(err));
            resultDefer.reject(err);
        });

    return resultDefer.promise;
}

module.exports.jsEnabled = (url ) => {
    let sitepage = null;

    const resultDefer = q.defer();
    const pjs = startPhantomInstance();

    debug('Starting JS-Enabled for url', url);
    pjs
        .then(function (instance) {
            return instance.createPage();
        }, function (e) {
            debug('failure', e);
            resultDefer.reject(e);
            throw new Error(e);
        })
        .then(function (page) {
            page.on('onClosing', false, function (data) {
                debug('onClosing JS sitepage caught');
            });
            page.on('onError', false, function (err) {
                debug('client JS console.error', JSON.stringify(err));
                //done(JSON.stringify(err));
            });
            page.on('onConsoleMessage', false, function (msg, lineNum, sourceId) {
                console.log('***CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
            });

            page.on('onResourceError', false, function(resourceError) {
                console.error('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
                console.error('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
                resultDefer.reject(resourceError);
            });

            page.on('onResourceTimeout', false, function(request) {
                console.error('Response (#' + request.id + '): ' + JSON.stringify(request));
                resultDefer.reject(request);
            });

            page.on('onError', false, function(err) {
                var msgStack = ['ERROR: ' + msg];

                if (trace && trace.length) {
                    msgStack.push('TRACE:');
                    trace.forEach(function(t) {
                        msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
                    });
                }
                console.error(msgStack.join('\n'));
                resultDefer.reject(msgStack);
            })

            sitepage = page;
            return sitepage.setting('javascriptEnabled', true);

        })
        .then(function () {
            return sitepage.open(url);
        })
        .then(function (status) {
            if (status !== 'success') {
                throw new Error('status = ' + status);
            }
            debug('success');
            return true;
        })
        .then(function () {

            var defer = q.defer();

            debug('logic comming');

            sitepage.on('onCallback', false, function (data) {
                console.log('INSIDE CALLBACK');

                defer.resolve(true);
            });

            sitepage.evaluate(function () {
                console.log('adding event listener');
                window.addEventListener('Idle', function () {
                    console.log('INSIDE eventListenr - phantom IDLE caught');
                    window.callPhantom({});
                });
            });

            return defer.promise;
        })
        .then(function () {
            debug('going to return content');
            return sitepage.property('content')
        })
        .then(function (contentPromise) {
            resultDefer.resolve(tidy(contentPromise));
            return sitepage.close();
        })
        .catch(function (err) {
            debug('Error', JSON.stringify(err));
            resultDefer.reject(err);
        });

    return resultDefer.promise;
};

module.exports.closePhantom = () => {
    const defer = q.defer();
    const pjs = startPhantomInstance();

    let phi = null;

    pjs.then((instance) => {
        phi = instance;
        phi.exit();
        debug('inside timeout');
        debug('After exit, phnstance = ', typeof phInstance);
        phInstance = null;
        defer.resolve(true);
    }).catch((err)=> {
        debug('Error while closing', err);
        phi.exit();
        phi.kill();
        defer.reject(err);
    });

    return defer.promise;
};

