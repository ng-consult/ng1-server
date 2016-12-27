'use strict';

var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;

var  angularDomServer =require( './../../../dist/AngularServerRenderer');
var config = require('./../config');


module.exports = function() {

    var angularServer = new angularDomServer(config);
    angularServer.config.server.setDomain('http://localhost:3002');

    var app = utils(express(), 'pug');

    app.get('/*', angularServer.middleware, function(req, res) {
        res.locals.ngServerConf = config ? config : {};
        res.render('index-classic');
    });

    return app;
};