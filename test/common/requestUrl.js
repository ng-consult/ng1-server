'use strict';

var q = require('q');
var fs = require('fs');
var path = require('path');
var chai = require('chai');
var phantom = require('phantom');
var shell = require('shelljs');
var tidy = require('./tidyHtml');
var debug = require('debug')('mocha-test');
var config = require('./../../test-server/server/config');
var CacheEngine = require('simple-url-cache').CacheEngine;

var expect = chai.expect;


var phInstance = null;

function startPhantomInstance() {

    var defer = q.defer();

    if(phInstance !== null){
        debug('PhantomJS instance already created');
        defer.resolve(phInstance);
    } else{
        phantom.create().then(function(instance) {
            debug('PhantomJS never created, instanciating');

            phInstance = instance;
            phInstance.on('onError', function(err){
                debug('Error caught on phantom instance', err);
            });
            defer.resolve(phInstance);
        });
    }

    return defer.promise;

};

module.exports.closePhantomJS = function() {

    describe('Stopping PhantomJS', function() {
        it('should stop it', function(done){
            var pjs = startPhantomInstance();
            var phi = null;
            pjs.then((instance) => {
                phi = instance;
                phi.exit();
                debug('inside timeout');
                debug('After exit, phnstance = ', typeof phInstance);
                phInstance = null;
                done();
            }).catch((err)=>{
                debug('Error while closing', err);
                phi.exit();
                phi.kill();
                done(err);
            });
        });
    })
};

module.exports.describeURL = function(url, conf) {

    var getFileName = function(url, prefix, name) {
        return path.join(__dirname, '/../outputs', url, prefix + '.' + name + '.html');
    };

    shell.mkdir('-p', path.join(__dirname, '/../outputs', url));

    describe('URL: '+ url, function() {

        conf.forEach(function(serverData) {



            after(function() {
                debug('Removing files...');
                try {
                    fs.unlinkSync(getFileName(url, serverData.prefix, 'js-disabled'));
                } catch(e) {
                    debug('unable to remove file ', getFileName(url, serverData.prefix, 'js-disabled'), e);
                }
                try {
                    fs.unlinkSync(getFileName(url, serverData.prefix, 'js-enabled'));
                } catch(e){
                    debug('unable to remove file ', getFileName(url, serverData.prefix, 'js-enabled'), e);
                }
            });


            describe(serverData.desc, function() {

                it('phantom with js disabled', function(done) {
                    var sitepage = null;

                    var pjs = startPhantomInstance();

                    pjs.then(function(instance) {
                            return instance.createPage();
                        })
                        .then(function(page) {
                            sitepage = page;
                            sitepage.on('onClosing', false , function(data) {
                                debug('Closing sitepage caught');
                            });

                            sitepage.on('onError', false , function(err) {
                                debug('sitepage eror caught', err);
                            });
                            return page.setting('javascriptEnabled', false);
                        })
                        .then( function(what) {
                            return sitepage.open(serverData.url + url);
                        })
                        .then(function(status) {
                            expect(status).to.equal('success');
                            return sitepage.property('content');
                        })
                        .then(function(html) {
                            fs.writeFileSync( getFileName(url, serverData.prefix, 'js-disabled'), tidy(html.trim()), 'utf-8');
                            return sitepage.close();
                        })
                        .then(function() {
                            done();
                        })
                        .catch(function(error) {
                            debug('Error', error);
                            done(error);
                        });
                });

                it('phantom with js enabled - wait 4000ms', function(done) {
                    var sitepage = null;
                    var pjs = startPhantomInstance();
                    pjs.then(function(instance) {
                            return instance.createPage();
                        })
                        .then(function(page) {
                            sitepage = page;

                            return sitepage.open(serverData.url + url);
                        })
                        .then(function(status) {
                            expect(status).to.equal('success');
                        })
                        .then( function() {

                            var defer = q.defer();

                            sitepage.on('onCallback', false , function(data) {
                                debug('StackQueueEmpty event caught');
                                defer.resolve(true);
                            });

                            sitepage.evaluate(function() {
                                window.addEventListener('StackQueueEmpty', function() {
                                    window.callPhantom({});
                                });
                            }).then(function() {});

                            return defer.promise;
                        })
                        .then(function() {
                            return sitepage.property('content')
                        })
                        .then(function(contentPromise) {
                            fs.writeFileSync(getFileName(url, serverData.prefix, 'js-enabled'), tidy(contentPromise));
                            sitepage.close();
                            done();
                        })
                        .catch(function(error) {
                            debug('Error', error);
                            done(error);
                        });
                });



                if(serverData.equals.length >= 2) {
                    it( serverData.equals[0] + ' should render the same HTML than ' + serverData.equals[1], function() {
                        var file1 = fs.readFileSync( getFileName(url, serverData.prefix, serverData.equals[0]), 'utf-8').trim();
                        var file2 = fs.readFileSync( getFileName(url, serverData.prefix, serverData.equals[1]), 'utf-8').trim();
                        expect(file1).to.equal(file2);
                    });
                }


                if(serverData.cache === true) {

                    describe('Caching', function() {

                        var cacheEngine = new CacheEngine(config.cache.storageConfig, config.cache.cacheRules);

                        var cachedUrl = cacheEngine.url(url);

                        it('The files should be cached', function() {
                            cachedUrl.isCached().then(function(cached) {
                                expect(cached).to.be.ok;
                                done();
                            });
                        });

                        it('The cache content should match phantom.js-enabled', function() {

                            var phantomJSHtml = fs.readFileSync( getFileName(url, serverData.prefix, 'js-enabled'), 'utf-8').trim();

                            cachedUrl.getUrl().then(function(content) {
                                expect(tidy(content)).to.eql(phantomJSHtml);
                            });
                        });
                    });    
                }


            });
        });
    });

};