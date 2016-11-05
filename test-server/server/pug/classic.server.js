/**
 * Created by antoine on 08/07/16.
 */
'use strict';
var express = require('express');
var utils = require('./../utils').express;


module.exports = function() {
    
    var app = utils(express(), 'pug');

    app.get('/*', function(req, res, next) {
        return res.render('index-classic');
    });

    return app;

};