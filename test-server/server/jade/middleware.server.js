/**
 * Created by antoine on 15/07/16.
 */


var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;

var angularDomServer = require('./../../../dist/server/AngularServerRenderer');

var config = require('./../config');
config.server.port = 3002;

var angularServer = new angularDomServer( Object.assign({ server: { domain: '127.0.0.1', port: 3001}},config));

var app = utils(express(), 'jade');

app.get('/*', angularServer.middleware, function(req, res) {
    res.render('index-classic');
});

module.exports = app;