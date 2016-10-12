"use strict";

var favicon = require('express-favicon');
var express = require('express');
var path = require('path');
var cons = require('consolidate');
var process = require('process');

var debugStr = "test-server";

var debug = require('debug')(debugStr);

module.exports.debugStr = debugStr;

module.exports.express = function (app, viewEngine) {

    app.use(favicon(__dirname + '/favicon.ico'));
    app.use(function (req, res, next) {
        debug('GET ', req.protocol + '://' + req.get('host') + req.originalUrl);
        res.set("Connection", "close");
        next();
    });

    app.use('/public', express.static(path.resolve(__dirname + '/../../test-server/bower')));
    app.use('/views', express.static(path.resolve(__dirname + '/../bower/angular.js-server-test-client/src/views')));
    app.use('/client-server-build', express.static(path.resolve(__dirname + '/../../dist')));

    switch (viewEngine) {
        case 'swig':
            app.engine('html', cons.swig);
            app.set('view engine', 'html');
            break;
        case 'jade':
            app.engine('jade', cons.jade);
            app.set('view engine', 'jade');
            break;
        default:
            throw new Error('unknown templating');
    }

    app.set('views', path.resolve(__dirname + '/' + viewEngine + '/views'));

    return app;
};


var serve = (expressApp, description, port) => {
    return new Promise((resolve, reject) => {
        expressApp.listen(port, function () {
            debug(description + ' started on 127.0.0.1:' + port);
            resolve(true);
        });

        process.on('uncaughtException', function (err) {
            reject(err);
        });
    });

};

module.exports.startApi = function () {
    var apiServer = require('./api/api-server');
    server(apiServer, 'api-server', 8080).then(() => {
        debug('API Server started');
    }, err => {
        debug('Some error happened while starting the Api Server', err);
    })
};

module.exports.startStatic = function() {
    var jadeClassicServer = require('./jade/classic.server');
    var apiServer = require('./api/api-server');
    Promise.all([
        serve(jadeClassicServer, 'jade - no server side rendering', 3000),
        serve(apiServer, 'api.server', 8080),
    ]).then(() => {
        debug('Static Server started');
    }, err => {
        debug('Some error happened while starting the servers', err);
    });
};

module.exports.testServers = function () {


    var apiServer = require('./api/api-server');

    var jadeClassicServer = require('./jade/classic.server');
    var jadePreRenderServer = require('./jade/pre-render.server');
    //var jadeMiddleWareServer = require('./jade/middleware.server');

    var swigClassicServer = require('./swig/classic.server');
    var swigPreRenderServer = require('./swig/pre-render.server');
    //var swigMiddleWareServer = require('./swig/middleware.server');

    Promise.all([
        serve(jadeClassicServer, 'jade - no server side rendering', 3000),
        serve(jadePreRenderServer, 'jade - server side rendering', 3001),
        //serve(jadeMiddleWareServer, 'jade - server side rendering middleware', 3002),

        serve(swigClassicServer, 'swig - no server side rendering', 3003),
        serve(swigPreRenderServer, 'swig - server side rendering', 3004),
        //serve(swigMiddleWareServer, 'swig - server side rendering middleware', 3005),

        serve(apiServer, 'api.server', 8080),
    ]).then(() => {
        debug('Servers started');
    }, err => {
        debug('Some error happened while starting the servers', err);

    });


};
