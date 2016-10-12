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
    ],
    config = server.config;

config.server.setDomain('http://localhost');
config.server.setPort(3000);
requestListenerFn = sinon.spy();


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

    app.post('/*', server.middleware(), function(req, res, next) {
        res.sendFile(__dirname + '/html/index.html');
    });

    app.get('/*', server.middleware(), function (req, res, next) {
        res.sendFile(__dirname + '/html/index.html');
    });

    return app.listen(3000, function (err) {
        if (err) {
            done(err);
        }
        done();
    })
};


describe.skip('The api & html servers', function () {

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

describe.skip('Launching the  Api & http server once', function(done) {
    it('should start the api server', function (done) {
        runningApi = apiServer(done);
    });

    it('should start the http server', function (done) {
        runningApp = staticServer(done);
    });
});


describe.skip('Unit Testing angular.js-server', function () {

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

});
describe.skip('Checking the middleware connectivity', function() {


    it('Should do nothing when the request is not GET', function() {
        server.config.render.setDefault('always');
        request.post({url:'http://localhost:3000/Todo', form: {}}, function(err,httpResponse,body){
            if (err) done(err);
            expect(body).to.eql(servedHtml);
            html = body
            done();
        });
    })
})