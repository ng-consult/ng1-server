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
    app.engine('jade', cons.jade);
    app.set('view engine', 'jade');

    app.set('views', path.resolve(__dirname + '/jade/views'));

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

module.exports.testServers = function () {


    var apiServer = require('./api/api-server');

    var jadeClassicServer = require('./jade/classic.server');


    Promise.all([
        serve(jadeClassicServer, 'jade - no server side rendering', 3000),
        serve(apiServer, 'api.server', 8080),
    ]).then(() => {
        debug('Servers started');
    }, err => {
        debug('Some error happened while starting the servers', err);

    });


};
