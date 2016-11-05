"use strict";
var Iconv = require('iconv').Iconv;
var path = require('path');
var chai = require('chai');
var fs = require('fs-extra');
var common = require('./common/requestUrl');
var debug = require('debug')('mocha-test-cache-server');
var testNgServer = require('./common/testLaunchNgServer');
const testWebServers = require('./common/testWebServers');
var request = require('request');
var yaml = require('js-yaml');
var expect = chai.expect;

const redisUtils = require('./common/redis');

const serverConfig = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname + './../../bin/configYaml/serverConfig.yml')), 'utf-8');

const cacheServerURL = serverConfig.socketServers.fff.protocol + serverConfig.socketServers.fff.host + ':' + serverConfig.socketServers.fff.port;


describe(`Launching ngServer`, () => {
    testNgServer.testStart();
});

describe(`Launching WebServer`, () => {
    testWebServers.testStart();
});


const notCachedUrls = [
    'http://127.0.0.1:3030/rfc/*/h/cn',
    'http://127.0.0.1:3030/rfc/*/h/fr',
    'http://127.0.0.1:3030/rfc/*/h/en'
];

const cachedUrls = [
    'http://127.0.0.1:8080/products/200',
    'http://127.0.0.1:8080/products/300'
];



describe('No referer', () => {

    describe(`URLs that shouldn't be cached`, () => {

        notCachedUrls.forEach((url) => {

            testWebServers.getFailedUrl(
                url,
                {},
                501
            );

        });

        cachedUrls.forEach((url) => {

            testWebServers.getFailedUrl(
                url,
                {},
                501
            );

        });
    });
});

describe('With a referer', () => {

    describe(`URLs that shouldn't be cached`, () => {

        notCachedUrls.forEach((url) => {

                testWebServers.getSuccessUrl(
                    url,
                    {'referer': 'http://127.0.0.1:3000'},
                    200,
                    {
                        'caching-status': 'NEVER',
                        'ngservercached': 'no'
                    },
                    true
                );

                testWebServers.getSuccessUrl(
                    url,
                    {'referer': 'http://127.0.0.1:3000'},
                    200,
                    {
                        'caching-status': 'NEVER',
                        'ngservercached': 'no'
                    },
                    true
                );
        });
    });

    describe(`URLs that should be cached`, () => {

        redisUtils.clearURLs('SLIMER_REST', ['http://127.0.0.1:8080/products/200','http://127.0.0.1:8080/products/300']);

        describe(`Loads them for the first time`, () => {


            cachedUrls.forEach((url) => {

                    testWebServers.getSuccessUrl(
                        url,
                        {'referer': 'http://127.0.0.1:3000'},
                        200,
                        {
                            'caching-status': 'NOT_CACHED',
                            'ngservercached': 'yes'
                        },
                        true
                    );
            });
        });

        describe(`Loads them for second first time`, () => {


            cachedUrls.forEach((url) => {

                    testWebServers.getSuccessUrl(
                        url,
                        {'referer': 'http://127.0.0.1:3000'},
                        200,
                        {
                            'caching-status': 'CACHED',
                            'ngservercached': 'yes'
                        },
                        true
                    );

            });

        });

        redisUtils.clearURLs('SLIMER_REST', ['http://127.0.0.1:8080/products/200','http://127.0.0.1:8080/products/300']);

        describe(`Loads them for third time`, () => {

            cachedUrls.forEach((url) => {

                    testWebServers.getSuccessUrl(
                        url,
                        {'referer': 'http://127.0.0.1:3000'},
                        200,
                        {
                            'caching-status': 'NOT_CACHED',
                            'ngservercached': 'yes'
                        },
                        true
                    );
                });

        });

    });
});


describe('Error testing', () => {
    describe.skip(`a URL wth a a strange invalid header `, () => {

        it(`retrieve it directly via request() should fail`, () => {

        });

        it(`should not load the URL`, () => {
        });
    });

    describe(`an invalid URL`, () => {
        testWebServers.getFailedUrl(
            'http://www',
            {
                referer: 'http://127.0.0.1:3000'
            },
            501
        );
    });

});



describe(`Querying URLs that shouldn't be cached`, () => {


    //tdo design a server that doesnt allow custm headers....


    /*

     it(`timer1 ${timer1} should be almost equal to timer2 ${timer2}`, () {

     });

     */

});

/*
    it(`headers should have headers['ngServerCached'] = 'yes'`, () => {

    });

    it(`timer1  should be much higher than timer2 `, () => {

    });
});

*/
describe.skip(`DDOS ATTACK`, () => {

});


describe('stopping web servers', () => {
    testWebServers.testStop();
});

describe('Stopping server', () => {
    testNgServer.testStop();
});

