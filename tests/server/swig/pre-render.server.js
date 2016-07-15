/**
 * Created by antoine on 08/07/16.
 */
/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var utils  = require('./../utils');
var swig = require('swig');

var app = express();

app = utils(app, 'swig');

var angularDomServer = require('./../../../server/lib/AngularServerRenderer');
var config = require('./../config');
var angularServer = new angularDomServer(config);

//all urls
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