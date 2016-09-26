"use strict";

var chai = require('chai');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");

var expect = chai.expect;
chai.use(sinonChai);

var path = require('path');
var fs = require('fs-extra');
var request = require('request');
var express = require('express');


var logFiles = {},
    testLogFile = path.resolve( process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']  + '/test');

describe('Mocking fs.writeFileSync', function() {

    beforeEach(function() {
        logFiles = {};
        try {
            fs.unlinkSync(testLogFile);
        } catch(e) {}
    });

    it('Should simulate the write ok', function() {
        var original = fs.writeFileSync;

        fs.writeFileSync = function () {
            if (typeof logFiles[arguments[0]] === 'undefined') {
                logFiles[arguments[0]] = [];
            }
            logFiles[arguments[0]].push(arguments[1]);

            return original.apply(null, arguments);
        };

        fs.writeFileSync(testLogFile, 'content', 'utf-8');
        expect(logFiles[testLogFile]).to.be.defined;
        expect(logFiles[testLogFile][0]).equal('content');
    });

    it('should write n the file as well', function() {
        fs.writeFileSync(testLogFile, 'content', 'utf-8');
        expect(fs.readFileSync(testLogFile, 'utf-8')).eql('content');
    });

    it('Should throw errors when *** happenes', function() {
        expect(function(){fs.writeFileSync('%^%&%someIUOIUINvalid)*)* PATH', 'content', 'utf-8')}).to.throwError;
    });
});

var AngularJsServer = require('./../../dist/AngularServerRenderer');

var apiServer,
    staticServer,
    app = express(),
    apiApp = express(),
    runningApp,
    runningApi,
    servedHtml = fs.readFileSync(path.resolve(__dirname + '/html/index.html'), 'utf-8'),
    wrongHtml = fs.readFileSync(path.resolve(__dirname + '/html/wrong.html'), 'utf-8'),
    server = new AngularJsServer(),
    config,
    html,
    renderedHtml,
    requestListenerFn,
    urls = [
        '/public/angular/angular.js',
        '/public/angular-resource/angular-resource.js',
        '/public/angular-route/angular-route.js',
        '/public/angular.js-server/dist/angular.js-server.js',
        '/public/angular.js-server-test-client/dist/app.js'
    ];

apiServer = function(done) {
    if (typeof done === 'undefined') {
        done = function () {
        };
    }
    apiApp.use(function (req, res, next) {
        requestListenerFn(req.url);
        let oneof = false;
        if(req.headers.origin) {
            //if (/noserver/.test(req.headers.origin) || /server/.test(req.headers.origin)) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            oneof = true;
            //}
        }
        if(req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if(req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if(oneof) {
            res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        // intercept OPTIONS method
        if (oneof && req.method == 'OPTIONS') {
            res.send(200);
        }
        else {
            next();
        }
    });

    apiApp.get('/products/:time', function(req, res) {
                    res.set("Connection", "close");

        setTimeout( function() {
            res.end(JSON.stringify([
                {
                    name: 'test',
                    price: 1
                },
                {
                    name: 'test2',
                    price: 2
                }]));
        }, req.params.time);
    });

    return apiApp.listen(8080, function(err) {
        if (err) {
            done(err);
        }
        done();
    });
};

staticServer = function (done) {
    if (typeof done === 'undefined') {
        done = function () {
        };
    }
    app.use(function (req, res, next) {
        requestListenerFn(req.url);
        res.set("Connection", "close");
        next();
    });

    app.use('/public', express.static(path.resolve(__dirname + '/../../test-server/bower')));
    app.use('/views', express.static(path.resolve(__dirname + '/../../test-server/bower/angular.js-server-test-client/src/views')));

    app.get('/*', function (req, res, next) {
        res.sendFile(__dirname + '/html/index.html');
    });

    return app.listen(3000, function (err) {
        if (err) {
            done(err);
        }
        done();
    })
};

beforeEach(function () {
    config = server.config;
    config.server.setDomain('http://localhost');
    config.server.setPort(3000);
    requestListenerFn = sinon.spy();
});

describe('The api & html servers', function () {

    it('should start the static server', function (done) {
        runningApp = staticServer(done);
    });

    it('should stop the static server', function (done) {
        runningApp.close(function (err) {
            if(err) {done(err)}
            done();
        });
    });

    it('should start the api server', function (done) {
        runningApi = apiServer(done);
    });

    it('The api server should return the correct products', function(done) {
        request('http://localhost:8080/products/200', function(err, response, body) {
            if(err) {done(err);}
            expect(JSON.parse(body)).eql([{"name":"test","price":1},{"name":"test2","price":2}]);
            done();
        })
    });

    it('When wrong url, his should be detected', function(done) {
        request('http://localhost:8080/some_wrong_url', function(err, response, body) {
            if(err) {done(err);}
            expect(response.statusCode).eql(404);
            done();
        })
    });


    it('should stop the api server', function (done) {
        runningApi.close(function (err) {
            if(err) {done(err)}
            done();
        });
    });

});

describe('Launching the  Api & http server once', function(done) {
    it('should start the api server', function (done) {
        runningApi = apiServer(done);
    });

    it('should start the http server', function (done) {
        runningApp = staticServer(done);
    });
});

describe('Unit Testing angular.js-server', function () {

    describe('Testing The static HTML', function () {

        it('Should get the RAW HTML ok', function (done) {
            request("http://localhost:3000/Todo", function (err, response, body) {
                if (err) done(err);
                expect(body).to.eql(servedHtml);
                html = body
                done();
            });
        });

        it('Should serve a static angular.js file ok', function (done) {
            request("http://localhost:3000/public/angular/angular.js", function (err, response, body) {
                if (err) done(err);
                expect(fs.readFileSync(path.resolve(__dirname + './../../test-server/bower/angular/angular.js'), 'utf-8')).to.eql(body);
                expect(requestListenerFn).to.calledWith("/public/angular/angular.js");
                done();
            })
        });

        it('Should serve the todos.html view ok', function (done) {
            request("http://localhost:3000/views/todos.html", function (err, response, body) {
                if (err) done(err);
                expect(fs.readFileSync(path.resolve(__dirname + './../../test-server/bower/angular.js-server-test-client/src/views/todos.html'), 'utf-8')).to.eql(body);
                sinon.assert.calledWith(requestListenerFn, "/views/todos.html");
                expect(requestListenerFn).to.calledWith("/views/todos.html");
                done();
            })
        });

    });

    describe('External Resources working test', function () {

        describe('When requesting all external scripts', function () {

            beforeEach(function() {
                config.cache.clearAllCachedUrl();
                config.cache.removeAllRules();
                config.server.setTimeout(1500);

                config.render.setStrategy('always');

                config.cache.setDefault('never');

                server.emptyExternalResources()

            });

            it('should render this HTML withouth error', function (done) {

                server.render(servedHtml, '/Todo').then(function (result) {
                    expect(result.code).to.eql(0);
                    renderedHtml = result.html;
                    done();
                }, function (result) {
                    done(result.status);
                }).catch(function(err) {
                    done(err);
                });
            });

            it('Should query all the external.js files on the test server', function (done) {
                server.render(servedHtml, '/Todo').then(function (result) {
                    urls.forEach(function (item) {
                        expect(requestListenerFn).to.calledWith(item);
                    })
                    done();
                }, function (result) {
                    done(result);
                });
            });

        });

        describe('When pre-loading the content of all *.js files with addExternalresource()', function () {

            it('Should precache all the external *.js files into AngularServer without any errors', function (done) {

                var count = 0;
                urls.forEach(function (scriptUrl) {
                    request('http://localhost:3000' + scriptUrl, function (err, response, body) {
                        if (err) done(err);
                        server.addExternalresource(scriptUrl, body);
                        count++;
                        if (count === urls.length) {
                            done();
                        }
                    });
                });
            });

            it('The external resources should load correctly', function (done) {


                var count = 0;

                var externalResources = server.getExternalResources();

                var checkExternalResourceExists = function (url, content) {
                    var found = false;
                    for (var i in externalResources) {
                        if (externalResources[i].url === url) {
                            found = i;
                        }
                    }
                    expect(found).to.not.eql(false);
                    expect(externalResources[found].url).to.eql(url);
                    expect(externalResources[found].content).to.eql(content);
                };

                urls.forEach(function (scriptUrl) {
                    request('http://localhost:3000' + scriptUrl, function (err, response, body) {
                        if (err) done(err);
                        checkExternalResourceExists(scriptUrl, body);
                        count++;
                        if (count === urls.length) {
                            done();
                        }
                    });
                });

            });

            it('render() should now output the same result as before', function () {
                server.render(html, '/Todo').then(function (result) {
                    expect(result.code).to.eql(0);
                    expect(renderedHtml).to.eql(result.html);
                    done();
                }, function (result) {
                    expect(result.code).to.eql(0);
                    ;
                    done();
                });
            });

            it('render() should not make any request to the external urls', function () {
                urls.forEach(function (item) {
                    expect(requestListenerFn).to.not.be.calledWith(item);
                });
            });

        });
    });

    describe('Breaking JSDOM', function() {

        it('We precache some invalid javascript to break JSDOM', function () {

            server.emptyExternalResources();
            urls.forEach(function (scriptUrl) {
                server.addExternalresource(scriptUrl, 'ahaha, I am a php script <? php echo "test";?>');
            });
        });

        it('The renderer should reject with JSDOM_ERROR status code' , function (done) {

            config.cache.clearAllCachedUrl();
            config.server.setTimeout(1500);
            config.render.setStrategy('always');

            config.cache.setDefault('never');
            config.cache.clearAllCachedUrl();
            config.cache.removeAllRules();

            server.render(servedHtml, '/Todo').then(function (result) {
                done(result);
            }, function (result) {
                expect(result.code).eql(6);
                done();
            });

        });

        it('The renderer should send the original html back', function (done) {

            config.cache.clearAllCachedUrl();
            config.server.setTimeout(1500);
            config.render.setStrategy('always');
            config.cache.removeAllRules();
            config.cache.setDefault('never');

            server.render(servedHtml, '/Todo').then(function (result) {
                done(result);
            }, function (result) {
                expect(result.html).eql(servedHtml);
                done();
            });

        });

        it('Should empty the dummy javascript', function () {
            server.emptyExternalResources();
            expect(server.getExternalResources()).eql([]);
        });

        it('The renderer should reject with JSDOM_URL_ERROR status code when requesting an unreachable JS url', function(done){

            config.cache.clearAllCachedUrl();
            config.server.setTimeout(1500);
            config.render.setStrategy('always');

            config.cache.setDefault('never');
            config.cache.clearAllCachedUrl();
            config.cache.removeAllRules();

            server.render(wrongHtml, '/Todo').then(function (result) {
                done(result);
            }, function (result) {
                expect(result.code).eql(7);
                done();
            });
        });

    });

    describe('/Todo URL', function() {

        describe('Pre-rendering disabled', function () {

            beforeEach(function () {
                config.render.setStrategy('never');
            });

            it('should get the correct RENDER_EXCLUDED status code', function (done) {
                expect(config.render.getStrategy()).to.eql('never');

                server.render(servedHtml, '/Todo').then(function (result) {
                    expect(result.code).to.eql(1);
                    done();
                }, function (result) {
                    expect(false).to.eql(true);
                    done();
                });
                /*.catch(function() {
                 expect(true).to.be.not.ok;
                 done();
                 });*/
            });

            it('should render the same html as the static html', function (done) {
                expect(config.render.getStrategy()).to.eql('never');

                server.render(servedHtml, '/Todo').then(function (result) {
                    expect(result.html).to.eql(servedHtml);
                    done();
                }, function (result) {
                    expect(false).to.eql(true);
                    done();
                });
            });

        });

        describe('Pre-rendering enabled ', function () {

            describe('with page caching off', function () {

                beforeEach(function () {
                    config.render.setStrategy('always');
                    config.cache.removeAllRules();
                    config.cache.setDefault('never');
                });

                it('should get the RENDERED status code', function (done) {
                    server.render(servedHtml, '/Todo').then(function (result) {
                        expect(result.code).to.eql(0);
                        done();
                    }, function (result) {
                        done(result);
                    }).catch(function (err) {
                        done(err);
                    });
                });

                it('should get the RENDERED status code again', function (done) {
                    server.render(servedHtml, '/Todo').then(function (result) {
                        expect(result.code).to.eql(0);
                        done();
                    }, function (result) {
                        done(result);
                    }).catch(function (err) {
                        done(err);
                    });
                });

                it('rendered html should get the list of todos', function (done) {
                    server.render(servedHtml, '/Todo').then(function (result) {
                        expect(/learn angular/.test(result.html)).to.eql(true);
                        expect(/build an angular app/.test(result.html)).to.eql(true);
                        done();
                    });
                });

            });

            describe('with page caching on', function () {

                var renderedTestHtml;

                beforeEach(function () {
                    config.render.setStrategy('always');
                    config.cache.removeAllRules();
                    config.cache.setDefault('always');

                });

                it('Should clear all the cached url', function (done) {
                    config.cache.clearAllCachedUrl().then(function (res) {
                        expect(res).eql(true);
                        done();
                    });
                });

                it('should get the RENDERED status code', function (done) {
                    server.render(servedHtml, '/Todo').then(function (result) {
                        expect(result.code).to.eql(0);
                        renderedTestHtml = result.html;
                        done();
                    });
                });

                it('should get the ALREADY_CACHED status code', function (done) {
                    server.render(servedHtml, '/Todo').then(function (result) {
                        expect(result.code).to.eql(2);
                        done();
                    });
                });

                it('should get the same output as the rendered output', function (done) {
                    server.render(servedHtml, '/Todo').then(function (result) {
                        expect(result.html).to.eql(renderedTestHtml);
                        expect(result.code).to.eql(2);
                        done();
                    });
                });

                it('rendered html should get the list of todos', function () {
                    server.render(servedHtml, '/Todo').then(function (result) {
                        expect(/learn angular/.test(result.html)).to.eql(true);
                        expect(/build an angular app/.test(result.html)).to.eql(true);
                        done();
                    });
                });

            });
        });
    });

    describe('Tiggering server Timeout', function () {

        describe('/Main/1000', function () {

            describe('Pre-rendering enabled', function () {

                describe('with page caching off', function () {

                    logFiles = {};

                    beforeEach(function () {
                        config.render.setStrategy('always');
                        config.cache.removeAllRules();
                        config.cache.setDefault('never');
                    });

                    it('Setting server timeout to 500ms', function () {
                        config.server.setTimeout(500);
                        expect(config.server.getTimeout()).equal(500);
                    });

                    it('Should get the SERVER_TIMEOUT status code', function(done) {
                        server.render(servedHtml, '/Main/1000').then(function (result) {
                            done(result);
                        }, function(result) {
                            expect(result.code).eql(3);
                            done();
                        });
                    });

                    it('the HTMl should be the same as the one sent for rendering', function (done) {
                        server.render(servedHtml, '/Main/1000').then(function (result) {
                            done(result.status);
                        }, function(result) {
                            expect(result.html).eql(servedHtml);
                            done();
                        });
                    });

                    it('Should log an error', function () {
                        expect(logFiles[config.log.getLogServerPath()]).to.be.defined;
                    });

                });

                describe('with page caching on', function () {

                    var renderedHtml;

                    it('sould clear all cache', function(done) {
                        config.render.setStrategy('always');
                        config.cache.removeAllRules();
                        config.cache.setDefault('always');
                        config.server.setTimeout(1500);
                        config.cache.clearAllCachedUrl().then(function(res) {
                            done();
                        });
                    });

                    it('Should get the RENDERED status code with a 1500ms timeout', function(done) {
                        server.render(servedHtml, '/Main/1000').then(function (result) {
                            expect(result.code).eql(0);
                            renderedHtml = result.html;
                            done();
                        }, function(result) {
                            done(result.status);
                        });
                    });

                    it('Should get the ALREADY_CACHED status code with  a 800 timeout', function(done) {
                        config.server.setTimeout(800);
                        server.render(servedHtml, '/Main/1000').then(function (result) {
                            expect(result.code).eql(2);
                            done();
                        }, function(result) {
                            done(result.status);
                        });
                    });

                    it('Should return the same html as the previous RENDERED response', function (done) {
                        server.render(servedHtml, '/Main/1000').then(function (result) {
                            expect(result.html).eql(renderedHtml);
                            done();
                        }, function(result) {
                            done(result.status);
                        });
                    });

                });
            });

            describe('Pre-rendering disabled', function () {

                it('Should return the original html', function () {

                })

                it('Should return code ? and status not-rendered', function () {

                })

            })

        })

    });

});


describe('Stopping servers', function() {
    it('should stop the static server', function (done) {
        runningApp.close(function (err) {
            if(err) {done(err)}
            done();
        });
    });
    it('should stop the api server', function (done) {
        runningApi.close(function (err) {
            if(err) {done(err)}
            done();
        });
    });
});
