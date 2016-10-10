/**
 * Created by antoine on 08/07/16.
 */

var express = require('express');
var utils = require('./../utils').express;

app = utils(express());

app.get('/*', function(req, res, next) {
    return res.render('index-classic');
});

module.exports = app;