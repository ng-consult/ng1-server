/**
 * Created by antoine on 08/07/16.
 */

var express = require('express');
var jade = require('jade');
var utils = require('./../utils');

var angularDomServer = require('./../../../server/lib/AngularServerRenderer');

var config = require('./../config');
config.server.domain = 'server.example';

var app = express();

var angularServer = new angularDomServer(config);

app = utils(app, 'jade');

app.get('/*', function(req, res) {

    var jadeHtml = jade.renderFile('./jade/views/index-classic.jade', {});

    var html = angularServer.render(jadeHtml, req.url);

    html.then(function(result) {
        res.send(result);
    }).fail(function(err) {
        res.send(err);
    });

});

module.exports = app;