'use strict';

var express = require('express');
var swig = require('swig');
var utils = require('./../utils').express;
var path = require('path');
var debug = require('debug')(require('./../utils').debugStr);
var Client = require('ng1-server-node-client');

module.exports = (config) => {

    var app = utils(express(), 'swig');

    app.get('/*', function(req, res) {

        app.locals.ngServerConf = config ? config : {};

        var tpl = swig.compileFile(__dirname + '/views/index-classic.html', {
            cache: false
        });
        var prehtml = tpl(app.locals);

        var client = new Client('http://127.0.0.1:8881');

        var url = 'http://127.0.0.1:3006' + req.url;

        client.renderHTML(url, prehtml, (ngData) => {

            switch(ngData.status) {
                case 2:

                    res.send(ngData.html);
                    break;
                case 1:
                case 4:
                    res.send(prehtml);
                    break;
                default:
                    throw new Error('Unknown status: ' + ngData.status);
            }

        });

    });

    return app;
};