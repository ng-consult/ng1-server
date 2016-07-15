/**
 * Created by antoine on 15/07/16.
 */
/**
 * Created by antoine on 08/07/16.
 */
/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var jade = require('jade');
var utils = require('./../utils');

var angularDomServer = require('./../../../server/lib/AngularServerRenderer');

var config = require('./../config');

var app = express();

var angularServer = new angularDomServer(config);

app = utils(app, 'jade');

app.get('/*', angularServer.middleware, function(req, res) {
    res.render('index-classic');
});

module.exports = app;