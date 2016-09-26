var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;

var angularDomServer = require('./../../../dist/AngularServerRenderer');

var angularServer = new angularDomServer();
angularServer.config.render.setStrategy('always');
angularServer.config.server.setPort(3002);
angularServer.config.server.setDomain('http://localhost');
angularServer.config.cache.setDefault('always');

var app = utils(express(), 'jade');

app.get('/*', angularServer.middleware, function(req, res) {
    res.render('index-classic');
});

module.exports = app;