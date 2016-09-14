/**
 * Created by antoine on 08/07/16.
 */

var express = require('express');
var utils = require('./../utils').express;

var app = utils(express(), 'swig');

app.get('/*', function(req, res) {
    res.render('index-classic');
});

module.exports = app;