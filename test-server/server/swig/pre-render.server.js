'use strict';

var express = require('express');
var swig = require('swig');
var utils = require('./../utils').express;
var path = require('path');
var debug = require('debug')(require('./../utils').debugStr);

var  angularDomServer =require( './../../../dist/AngularServerRenderer');
var config = require('./../config');

var angularServer = new angularDomServer(config);
angularServer.config.server.setDomain('http://localhost:3004');

var app = utils(express(), 'jade');

app.get('/*', function(req, res) {

    var tpl = swig.compileFile(__dirname + '/views/index-classic.html', {
        cache: false
    });
    var prehtml = tpl({});

    var html = angularServer.render(prehtml, req.url, function(err, result) {
        if(err) {
            debug('An error happened', err);
            res.send(err.html);
        } else {
            debug('render called suvvcessfull', result.status);
            res.send(result.html);
        }
    });

});

module.exports = app;