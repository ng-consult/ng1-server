'use strict';

var express = require('express');
var jade = require('jade');
var utils = require('./../utils').express;
var path = require('path');
var debug = require('debug')(require('./../utils').debugStr);
var messages = require('./../../../dist/MESSAGES');

var app = utils(express(), 'jade');

app.get('/*', function(req, res) {

    var jadeHtml = jade.renderFile( path.join(__dirname , 'views/index-classic.jade'), {});

    var Client = require('./../../../dist/client').default;

    var client = new Client('http://127.0.0.1:8881');
    
    var url = 'http://127.0.0.1:3001' + req.url;
    client.renderHTML(url, jadeHtml, (ngData) => {
        debug('jade Server render received response');
        debug(ngData);

        switch(ngData.status) {
            case messages.ENUM_RENDER_STATUS.HTML:
                res.send(ngData.html);
                break;
            case messages.ENUM_RENDER_STATUS.ERROR:
            case messages.ENUM_RENDER_STATUS.NO_RENDER:
                res.send(jadeHtml);
                break;
            default:
                throw new Error('Unknown status: ' + ngData.status);
        }

    });

});

module.exports = app;