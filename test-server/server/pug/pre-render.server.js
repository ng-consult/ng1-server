'use strict';

var express = require('express');
var jade = require('pug');
var utils = require('./../utils').express;
var path = require('path');
var debug = require('debug')(require('./../utils').debugStr);
var Client = require('ng1-server-node-client');

// todo write an express middleware that uses the client.

module.exports = (config) => {

    const app = utils(express(), 'pug');

    app.get('/*', function(req, res) {

        res.locals.ngServerConf = config ? config : {};

        var jadeHtml = jade.renderFile( path.join(__dirname , 'views/index-classic.pug'), res.locals);

        var client = new Client('http://127.0.0.1:8881');

        var url = 'http://127.0.0.1:3001' + req.url;

        debug('Calling client with url', url);

        client.renderHTML(url, jadeHtml, (ngData) => {
            debug('jade Server render received response');
            debug(ngData);

            switch(ngData.status) {
                case 2:
                    res.send(ngData.html);
                    break;
                case 1:
                case 4:
                    res.send(jadeHtml);
                    break;
                default:
                    throw new Error('Unknown status: ' + ngData.status);
            }

        });

    });

    return app;
};