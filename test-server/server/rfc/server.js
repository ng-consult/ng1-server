"use strict";
var favicon = require('express-favicon');
var express = require('express');
var dbg = require('debug');
var debugStr = require('./../utils').debugStr;
var debug = dbg(debugStr);

var rfcServer = express();

rfcServer.use(favicon(__dirname + '/../favicon.ico'));


rfcServer.use(function(req, res, next) {
    debug(req.method, req.protocol + '://' + req.get('host') + req.originalUrl);
    res.set("Connection", "close");
    next();
});


rfcServer.get('/rfc/:origin/:headers/:lang', function(req,res)  {

    if(req.params['origin']) {
        res.setHeader('Access-Control-Allow-Origin', req.params.origin);
    }

    if(req.params['headers']) {
        res.setHeader('Access-Control-Allow-Headers', req.params.headers);
    }

    switch(req.params.lang) {
        case 'en':
            res.setHeader('content-type', 'text/html; charset=UTF-8');
            res.status(200).send('Hello World');
            break;
        case 'fr':
            res.setHeader('content-type', 'text/html; charset=ISO-8859-1');
            res.status(200).send('hétérogénéité');
            break;
        case 'cn':
            res.setHeader('content-type', 'text/html; charset=Big5');
            res.status(200).send('常用字');
            break;
        default:
            res.setHeader('content-type', 'text/html; charset=UTF-8');
            res.status(501).send('lang not allowed');
    }

});

module.exports = rfcServer;

