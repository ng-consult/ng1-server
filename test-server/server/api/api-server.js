var express = require('express');
var dbg = require('debug');
var debugStr = require('./../utils').debugStr;
var debug = dbg(debugStr);
var products = require('./products');
var apiServer = express();


apiServer.get("*", function(req, res, next) {
    var url = req.url;
    debug('API SERVER REQUESTING ', url);

    var oneof = false;
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

apiServer.get('/products/:time', function(req, res) {
    setTimeout( function() {
        debug('Sending back products');
        res.set("Connection", "close");
        res.end(JSON.stringify(products));
    },req.params.time);
});

module.exports = apiServer;

