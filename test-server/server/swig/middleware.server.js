/**
 * Created by antoine on 15/07/16.
 */

var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;

var angularDomServer = require('./../../../dist/server/AngularServerRenderer');

var config = require('./../config');
config.server.port = 3005;

var angularServer = new angularDomServer(config);

var app = utils(express(), 'swig');

app.get('/*', angularServer.middleware, function(req, res) {
    res.render('index-classic');
});

module.exports = app;