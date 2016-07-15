/**
 * Created by antoine on 08/07/16.
 */
/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var utils = require('./../utils');

var app = express();

app = utils(app, 'jade');

app.get('/*', function(req, res) {
    res.render('index-classic');
});


module.exports = app;