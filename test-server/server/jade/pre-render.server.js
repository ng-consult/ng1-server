/**
 * Created by antoine on 08/07/16.
 */

var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;
var path = require('path');
var debug = require('debug')(require('./../utils').debugStr);

var angularDomServer = require('./../../../dist/AngularServerRenderer');

var angularServer = new angularDomServer();
angularServer.config.render.setStrategy('always');
angularServer.config.server.setPort(3001);
angularServer.config.server.setDomain('http://localhost');
angularServer.config.cache.setDefault('always');

var app = utils(express(), 'jade');

app.get('/*', function(req, res) {

    var jadeHtml = jade.renderFile( path.join(__dirname , 'views/index-classic.jade'), {});

    var html = angularServer.render(jadeHtml, req.url);

    html.then(function(result) {
        debug(result.status);
        res.send(result.html);
    }, function(err) {
        debug('ERROR WITH JADE', err.status);
        res.send(err.html);
    }).catch(function(err) {
        debug('ERROR WITH JADE', err.status);
        res.send(err.html);
    });

});

module.exports = app;