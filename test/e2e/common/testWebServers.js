"use strict";

var chai = require('chai');
var debug = require('debug')('mocha-test-server');
var expect = chai.expect;
var request = require('request');
var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
const utils = require('./../../../test-server/server/utils');


const loadedURLs = {};

const serverConfig = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname + './../../../bin/configYaml/serverConfig.yml')), 'utf-8');

const cacheServerURL = serverConfig.socketServers.fff.protocol + serverConfig.socketServers.fff.host + ':' + serverConfig.socketServers.fff.port;

const buildRequestURL = (url) => {
    return cacheServerURL + '/get?url=' + url;
};

let runningServers = [];

module.exports.getFailedUrl = (url, headers, expectedStatus) => {
    it(`${url} should fail`, (done) => {
        request({
            uri: buildRequestURL(url),
            headers: headers
        }, (error, response) => {
            if(error) {
                return done(error);
            }
            expect(response.statusCode).eql(expectedStatus);
            done();
        });
    });
};

module.exports.getSuccessUrl = (url, headers, expectedStatus, expectedHeaders, expectedBody) => {

    describe(`${url}`, () => {

        let responseData,
            bodyData,
            timer;

        if(typeof loadedURLs[url] === 'undefined') {

            it(`retrieving ${url} directly via request`, (done) => {
                timer = Date.now();
                request({
                    uri: url,
                    method: 'GET'
                }, (error, response, body) => {
                    if(error) {
                        return done(error);
                    }
                    timer = Date.now() - timer;
                    expect(response.statusCode).eql(200);
                    loadedURLs[url] = {
                        body: body,
                        headers: response.headers,
                        timer: timer
                    };
                    done();
                });
            });

        }

        it(`should retrieve with a a statusCode of ${expectedStatus}`, (done) => {
            timer = Date.now();
            request({
                uri: buildRequestURL(url),
                method: 'GET',
                headers: headers
            }, (error, response, body) => {
                if(error) {
                    return done(error);
                }
                bodyData = body;
                responseData = response;
                timer = Date.now() - timer;
                expect(response.statusCode).eql(expectedStatus);
                done();
            });
        });


        for(var i in expectedHeaders) {
            it(`${i} should equal ${expectedHeaders[i]}`, () => {
                expect(typeof responseData.headers[i]).not.eql('undefined');
                expect(responseData.headers[i]).eql(expectedHeaders[i]);
            });
        }

        it(`content-type should be correct`, () => {
            expect(typeof responseData.headers['content-type']).not.eql('undefined');
            expect(responseData.headers['content-type']).eql(loadedURLs[url].headers['content-type']);
        });

        if(expectedBody === true) {
            it(`body content matches direct request body content`, () => {
                expect(bodyData).eql(loadedURLs[url].body);
            });
        }

    });
};

module.exports.testStart = function() {
    describe('Starting test servers', function(){


        it(`All servers should start with cacheServerURL = ${cacheServerURL}`, (done) => {

            utils.startWebServers(cacheServerURL, (err, servers) => {
                if(err) {
                    return done(err);
                }
                runningServers = servers;
                done();
            })
        });

    });

};

module.exports.testStop= function() {
    describe(`Stopping the test servers`, function() {

        it('Should close all the servers', function(done){

            utils.stopWebServers(runningServers, err => {
                if(err) return done(err);
                runningServers = [];
                done();
            });
        });
    });
};