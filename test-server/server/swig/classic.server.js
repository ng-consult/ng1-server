/**
 * Created by antoine on 08/07/16.
 */
"use strict";

var express = require('express');
var utils = require('./../utils').express;


module.exports = () => {

    var app = utils(express(), 'swig');

    app.get('/*', function(req, res) {
        res.render('index-classic');
    });

    return app;

};