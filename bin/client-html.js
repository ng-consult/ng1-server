#!/usr/bin/env node

"use strict";
var Client = require('ng1-server-node-client');
var request = require('request');
var debug = require('debug')('ngServer-test');
var client = new Client('http://127.0.0.1:8881');
var messages = require('./../dist/MESSAGES');

var url = 'http://127.0.0.1:3000/Main';

request.get(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            client.renderHTML(url, body, (ngData) => {
                debug('jade Server render received response');
                debug(ngData);

                switch(ngData.status) {
                    case messages.ENUM_RENDER_STATUS.HTML:
                        console.log('OK');
                        break;
                    case messages.ENUM_RENDER_STATUS.ERROR:
                    case messages.ENUM_RENDER_STATUS.NO_RENDER:
                        console.log('NOT OK');
                        break;
                    default:
                        throw new Error('Unknown status: ' + ngData.status);
                }

            });
        }
});