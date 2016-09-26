var express = require('express');
var swig = require('swig');
var utils = require('./../utils').express;
var path = require('path');
var angularDomServer = require('./../../../dist/AngularServerRenderer');
var debug = require('debug')(require('./../utils').debugStr);

var angularServer = new angularDomServer();
angularServer.config.render.setStrategy('always');
angularServer.config.server.setPort(3004);
angularServer.config.server.setDomain('http://localhost');
angularServer.config.cache.setDefault('always');

var app = utils(express(), 'jade');

app.get('/*', function(req, res) {

    var tpl = swig.compileFile(__dirname + '/views/index-classic.html', {
        cache: false
    });
    var prehtml = tpl({});

    var html = angularServer.render(prehtml, req.url);

    html.then(function(result) {
        debug(result.status);
        res.send(result.html);
    }, function(err) {
        debug('ERROR WITH SWIG', err.status);
        res.send(err.html);
    }).catch(function(err) {
        debug('ERROR WITH SWIG', err.status);
        res.send(err.html);
    });

});

module.exports = app;