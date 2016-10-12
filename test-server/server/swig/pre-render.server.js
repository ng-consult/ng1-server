'use strict';

var express = require('express');
var swig = require('swig');
var utils = require('./../utils').express;
var path = require('path');
var debug = require('debug')(require('./../utils').debugStr);
var messages = require('./../../../dist/MESSAGES');

var app = utils(express(), 'jade');

app.get('/*', function(req, res) {

    var tpl = swig.compileFile(__dirname + '/views/index-classic.html', {
        cache: false
    });
    var prehtml = tpl({});

    var Client = require('./../../../dist/Client').default;

    var client = new Client('http://127.0.0.1:8881');

    var url = 'http://127.0.0.1:3005' + req.url;

    client.renderHTML(req.url, prehtml, (ngData) => {
        switch(ngData.status) {
            case messages.ENUM_RENDER_STATUS.HTML:
                res.send(ngData.html);
                break;
            case messages.ENUM_RENDER_STATUS.ERROR:
            case messages.ENUM_RENDER_STATUS.NO_RENDER:
                res.send(prehtml);
                break;
            default:
                throw new Error('Unknown status: ' + ngData.status);
        }
    });

});

module.exports = app;