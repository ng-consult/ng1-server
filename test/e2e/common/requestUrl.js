'use strict';

var phantomHelper = require('./phantomHelper')
var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
var debug = require('debug')('mocha-test');
var request = require('request');
var expect = chai.expect;
var async = require('async');
var tidy = require('./tidyHtml');

module.exports.testClosePhantomJS = function () {

    describe('Stopping PhantomJS', function () {
        it('should stop it', function (done) {
            phantomHelper.closePhantom().then( () => {
                done();
            }, (err) => {
                done(err);
            });
        });
    });
};

module.exports.getRequestedData = function(url, cb) {

    var data = {
        server: {
            cache: {
                html: null,
                networkRequests: []
            },
            nocache: {
                html: null,
                networkRequests: []
            }
        },
        noserver: {
            cache: {
                html: null,
                networkRequests: []
            },
            nocache: {
                html: null,
                networkRequests: []
            }
        }
    };
    const urls = [3000, 3001, 3002, 3003].map( (port) => {
        return `http://localhost:${port}/${url}`;
    });

    async.map(urls, getRequestedDati, (err, results) => {
        if(err) return cb(err);
        data.server.cache = results[3];
        data.server.nocache = results[1];
        data.noserver.cache = results[2];
        data.noserver.nocache = results[0];
        cb(null, data);

    });
};

var getRequestedDati = function(url, cb) {

    var results = {
        curl: null,
        js: null,
        networkRequests: null,
        curlTime: 0,
        jsTime: 0
    };

    const t1 = Date.now();
    request(url, function (error, response, body) {
        if(error) {
            debug(error);
            return cb(error);
        }

        if (!error && response.statusCode == 200) {
            const regex = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
            const matches = regex.exec(body);
            results.curl = tidy(matches[0]);
            results.curlTime = Date.now() - t1;

            phantomHelper.jsEnabled(url).then( data => {
                results.js = data.html;
                results.networkRequests = data.networkRequests;
                results.jsTime = Date.now() - results.curlTime;
                return cb(null, results);
            }, err => {
                debug(err);
                return cb(err);
            }).catch((err) =>{
                debug(err);
                return cb(err);
            });
        }
    });
};