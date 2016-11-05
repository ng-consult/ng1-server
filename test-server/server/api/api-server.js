"use strict";

var express = require('express');
var dbg = require('debug');
var debugStr = require('./../utils').debugStr;
var debug = dbg(debugStr);
var products = require('./products');
var apiServer = express();


apiServer.options('*', function(req, res, next) {
    debug('OPTION CALLED', req.url);
    next();
});

apiServer.use(function(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    //res.setHeader('Access-Control-Allow-Headers', '*');
    if ( req.method === 'OPTIONS' ) {
        res.writeHead(200);
        res.end();
        return;
    }

    debug('Inside CORS');
    //todo uncoment this for testing
    //res.header('Access-Control-Allow-Headers', 'ngServerRest');
    next();
});

/*
apiServer.get("*", function(req, res, next) {
    var url = req.url;
    debug('API SERVER REQUESTING ', url);

    var oneof = false;
    debug('ORIGIN = ', req.headers.origin);
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
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.send(200);
    }
    else {
        next();
    }
});
*/
apiServer.get('/products/:time', function(req, res) {
    setTimeout( function() {
        debug('Sending back products');
        res.set("Connection", "close");
        res.setHeader('content-type', 'application/json; charset=UTF-8');
        res.end(JSON.stringify(products));
    },req.params.time);
});

module.exports = apiServer;

