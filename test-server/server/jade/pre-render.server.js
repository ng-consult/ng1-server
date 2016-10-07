'use strict';


var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;
var path = require('path');
var debug = require('debug')(require('./../utils').debugStr);

var  angularDomServer =require( './../../../dist/AngularServerRenderer');
var config = require('./../config');

var angularServer = new angularDomServer(config);
angularServer.config.server.setDomain('http://localhost:3001');

var app = utils(express(), 'jade');

app.get('/*', function(req, res) {

    var jadeHtml = jade.renderFile( path.join(__dirname , 'views/index-classic.jade'), {});

    var html = angularServer.render(jadeHtml, req.url, function(err, result) {
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