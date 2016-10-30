'use strict';

var q = require('q');
var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
var phantom = require('phantom');
var tidy = require('./tidyHtml');
var debug = require('debug')('mocha-test');
var phDebug = require('debug')('mocha-test-phantom');

var config = require('./../../../test-server/server/config');
var CacheEngine = require('simple-url-cache').CacheEngine;

var expect = chai.expect;

var phInstance = null,
    cacheEngine,
    cachedUrl;

function startPhantomInstance() {

    var defer = q.defer();

    if(phInstance !== null){
        //debug('PhantomJS instance already created');
        defer.resolve(phInstance);
    } else{
        phantom.create(/*[], { warn: phDebug, debug: phDebug, error: phDebug, info: phDebug, log:phDebug}*/).then(function(instance) {
            debug('PhantomJS never created, instanciating');
            phInstance = instance;
            phInstance.on('onError', function(err){
                debug('Error caught on phantom instance', err);
                defer.reject(err);
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
        return path.join(__dirname, '/../outputs', encodeURIComponent(url), prefix + '.' + name + '.html');
    };

    describe('Creating the output directory: ', function() {
        it('Should create the directory ' + path.join(__dirname, '/../outputs', encodeURIComponent(url)), function(done) {
            try{
                fs.mkdirsSync(path.join(__dirname, '/../outputs', encodeURIComponent(url)));
                done();
            }
            catch(e) {
                done(e);
            }
        });
    })

    describe('URL: '+ url, function() {

        conf.forEach(function(serverData) {



            describe(serverData.desc, function() {


                beforeEach(function() {
                    cacheEngine = new CacheEngine(
                        serverData.url,
                        {
                            type: 'file',
                            dir: path.resolve( process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']  + '/cache/angular.js-server')
                        },
                        {
                            default: 'always',
                            cacheMaxAge: [],
                            cacheAlways: [],
                            cacheNever: []
                        }
                    );
                });

                it('phantom with js disabled', function(done) {
                    var sitepage = null;

                    var pjs = startPhantomInstance();

                    pjs.then(function(instance) {
                            return instance.createPage();
                        })
                        .then(function(page) {
                            sitepage = page;
                            sitepage.on('onClosing', false , function(data) {
                                //debug('Closing sitepage caught');
                            });

                            sitepage.on('onError', false , function(err) {
                                //debug('sitepage error caught', JSON.stringify(err));
                                //done(JSON.stringify(err));
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
                        .catch(function(err) {
                            debug('Error', JSON.stringify(err));
                            done(error);
                        });
                });

                it('phantom with js enabled - wait 4000ms', function(done) {
                    var sitepage = null;
                    var pjs = startPhantomInstance();
                    pjs.then(function(instance) {
                            return instance.createPage();
                        }, function(e){
                            done(e);
                        })
                        .then(function(page) {
                            sitepage = page;
                            sitepage.on('onError', false , function(err) {
                                debug('client console.error', JSON.stringify(err));
                                //done(JSON.stringify(err));
                            });
                            sitepage.on('onLog', false , function(err) {
                                debug('client console.log', JSON.stringify(err));
                                //done(JSON.stringify(err));
                            });
                            return sitepage.open(serverData.url + url);
                        })
                        .then(function(status) {
                            expect(status).to.equal('success');
                        })
                        .then( function() {

                            var defer = q.defer();

                            sitepage.on('onCallback', false , function(data) {
                                defer.resolve(true);
                            });

                            sitepage.evaluate(function() {
                                window.addEventListener('Idle', function() {
                                    window.callPhantom({});
                                });
                            }).then(function() {});

                            return defer.promise;
                        })
                        .then(function() {
                            return sitepage.property('content')
                        })
                        .then(function(contentPromise) {
                            try{
                                fs.writeFileSync(getFileName(url, serverData.prefix, 'js-enabled'), tidy(contentPromise), 'utf-8');
                            } catch(e) {
                                done(e);
                            }
                            var c = sitepage.close();
                            done();
                            return c;
                        })
                        .catch(function(err) {
                            debug('Error', JSON.stringify(err));
                            done(JSON.stringify(err));
                        });
                });

                if(serverData.equals.length >= 2) {
                    it( serverData.equals[0] + ' should render the same HTML than ' + serverData.equals[1], function(done) {
                        try{
                            var file1 = fs.readFileSync( getFileName(url, serverData.prefix, serverData.equals[0]), 'utf-8').trim();
                            var file2 = fs.readFileSync( getFileName(url, serverData.prefix, serverData.equals[1]), 'utf-8').trim();
                            expect(file1).to.equal(file2);
                            done();
                        } catch(e) {
                            done(e);
                        }

                    });
                }

                if(serverData.cache === true) {

                    beforeEach(function() {
                        cachedUrl = cacheEngine.url(url);
                    });

                    it('The files should have been cached by the server', function(done) {
                        cachedUrl.has().then(function(cached) {
                            expect(cached).to.be.ok;
                            done();
                        }, function(e) {
                            debug('cachedURL = ', cachedUrl);
                            done(e);
                        }).catch(function(err){
                            done(err);
                        });
                    });

                    it('The server cached file should match phantom.js-enabled\'s output', function(done) {

                        try {
                            var phantomJSHtml = fs.readFileSync( getFileName(url, serverData.prefix, 'js-enabled'), 'utf-8').trim();
                            cachedUrl.get().then(function(content) {
                                expect(tidy(content).trim()).to.eql(phantomJSHtml);
                                done();
                            }, function(err) {
                                done(err);
                            }).catch(function(err) {
                                done(err)
                            });

                        } catch(e) {
                            done(e);
                        }

                    });

                    it('We remove the server\'s cached file', function(done) {
                        cachedUrl.delete().then(function(removed) {
                            expect(removed).eql(true);
                            done();
                        }, function(err){
                            done(err);
                        })
                    });

                };

                it('Should remove test files ok', function(done) {
                    try {
                        fs.unlinkSync(getFileName(url, serverData.prefix, 'js-disabled'));
                        fs.unlinkSync(getFileName(url, serverData.prefix, 'js-enabled'));
                        done();
                    } catch(e) {
                        done(e);
                    }
                });
            });
        });
    });

};