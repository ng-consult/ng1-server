"use strict";

var favicon = require('express-favicon');
var express = require('express');
var path = require('path');
var cons = require('consolidate');
//var process = require('process');

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
        case 'pug':
            app.engine('pug', cons.pug);
            app.set('view engine', 'pug');
            break;
        default:
            throw new Error('unknown templating '+ viewEngine);
    }

    app.set('views', path.resolve(__dirname + '/' + viewEngine + '/views'));

    return app;
};

process.setMaxListeners(30);

var serve = (expressApp, description, port) => {
    return new Promise((resolve, reject) => {

        const server = expressApp.listen(port, function () {
            debug(description + ' started on 127.0.0.1:' + port);

            resolve( {
                server: server,
                description: description,
                port: port
            });
        });

        process.once('uncaughtException',  (err) => {
            debug('Some **** happened', err);
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

module.exports.stopWebServers = (runningServers, cb) => {

    const nbRunningServers = runningServers.length;
    let nbServerStopped = 0;

    debug('NB SERVERS TO STOP: ', nbRunningServers);

    runningServers.forEach( server => {
        debug(`stopping ${server.description} on port ${server.port}`);
        server.server.close( err => {
            if(err) { debug(err); return cb(err);}
            nbServerStopped++;
            debug(`server ${server.description} stopped` );
            if(nbServerStopped === nbRunningServers) {
                debug('All servers stopped successfully');
                cb(null);
            }
        })
    });
};

module.exports.startWebServers = function (restServerURL, cb) {

    const apiServer = require('./api/api-server');
    const rfcServer = require('./rfc/server');

    const appDebug = false;
    const jadeClassicServer = require('./pug/classic.server')({debug: appDebug});
    const jadePreRenderServer = require('./pug/pre-render.server')({debug: appDebug});
    //const jadeMiddleWareServer = require('./pug/middleware.server')();

    //var swigClassicServer = require('./swig/classic.server')();
    //var swigPreRenderServer = require('./swig/pre-render.server')();
    //var swigMiddleWareServer = require('./swig/middleware.server')();

    const promiseArray = [
        serve(jadeClassicServer, 'jade - no server side rendering', 3000),
        serve(jadePreRenderServer, 'jade - server side rendering', 3001),
        //serve(jadeMiddleWareServer, 'jade - server side rendering middleware', 3003),

        //serve(swigClassicServer, 'swig - no server side rendering', 3004),
        //serve(swigPreRenderServer, 'swig - server side rendering', 3005),
        //serve(swigMiddleWareServer, 'swig - server side rendering middleware', 3007),

        serve(rfcServer, 'rfc server', 3030),

        serve(apiServer, 'api.server', 8080)
    ];

    if(typeof restServerURL === 'string' &&  restServerURL.length > 0) {
        const jadeClassicServerREST = require('./pug/classic.server')({restServerURL: restServerURL, restCache: true, debug: appDebug});
        const swigClassicServerREST = require('./swig/pre-render.server')({restServerURL: restServerURL, restCache: true, debug: appDebug});
        promiseArray.push(serve(jadeClassicServerREST, 'jade - no server side rendering with REST caching', 3002));
        promiseArray.push(serve(swigClassicServerREST, 'swig - no server side rendering with REST caching', 3006));
    }

    Promise.all(promiseArray).then((servers) => {
        debug('Servers started');
        cb(null, servers);
    }, (err) => {
        debug('Some error happened while starting the servers', err);
        cb(err, null);
    }).catch( (err) => {
        debug('Some error happened while starting the servers', err);
        cb(err, null);
    });

};


/*
    ngServer
*/

let master = null;

module.exports.startNgServer = (configPath, cb) => {
    const Master = require('./../../dist/ng-server');
    master = new Master(configPath);
    master.start( cb );
};

module.exports.stopNgServer = (cb) => {

    master.stop( (err) => {
        if(err) return cb(err);
        master = null;
        cb();
    } );

};
