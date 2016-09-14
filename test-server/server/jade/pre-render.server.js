/**
 * Created by antoine on 08/07/16.
 */

var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;
var path = require('path');
var angularDomServer = require('./../../../dist/server/AngularServerRenderer');

var config = require('./../config');
config.server.port = 3001;


var angularServer = new angularDomServer(config);

var app = utils(express(), 'jade');

app.get('/*', function(req, res) {

    var jadeHtml = jade.renderFile( path.join(__dirname , 'views/index-classic.jade'), {});

    var html = angularServer.render(jadeHtml, req.url);

    html.then(function(result) {
        res.send(result);
    }).catch(function(err) {
        console.error('ERROR WITH JADE', err);
        res.send(err);
    });

});

module.exports = app;