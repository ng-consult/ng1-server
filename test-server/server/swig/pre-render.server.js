/**
 * Created by antoine on 08/07/16.
 */


var express = require('express');
var utils  = require('./../utils').express;
var swig = require('swig');
var angularDomServer = require('./../../../dist/server/AngularServerRenderer');
var config = require('./../config');

var app = utils(express(), 'swig');
config.server.port = 3004;

var angularServer = new angularDomServer(config);

app.get('/*', function(req, res) {
    
    var tpl = swig.compileFile('./swig/views/index-classic.html', {
        cache: false
    });
    var prehtml = tpl({});

    var html = angularServer.render(prehtml, req.url);

    html.then(function(result) {
        res.send(result);
    }).fail(function(err) {
        res.send(err);
    });

});

module.exports = app;