/**
 * Created by antoine on 08/07/16.
 */
'use strict';
var express = require('express');
var utils = require('./../utils').express;


module.exports = function(config) {

    var app = utils(express(), 'pug');

    app.get('/*', function(req, res, next) {

        res.locals.ngServerConf = config ? config : {};

        return res.render('index-classic');
    });

    return app;

};