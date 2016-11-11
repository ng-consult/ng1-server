'use strict';

/**
 * test should be:

 A - client only
    AA - REST set ON
         1a - clear all cache
         2 - Launch on 3000 with REST URL not SET
         3 - save output1 + recorded time1
         4 - Launch on 30000 with REST URL not SET 2dd time
         5 - save output2 + recorded time2
         6 - output1 === output2
         7 - time1 >>> time2
         8 - check URL cache content is set and correct

    AB - REST set OFF
         1a - clear all cache
         2 - Launch on 30000 with REST URL not SET
         3 - save output3 + recorded time3
         4 - Launch on 30000 with REST URL not SET 2dd time
         5 - save output4 + recorded time4
         6 - output3 === output4
         7 - time3 == time4
         8 - check URL cache content is not set

 B - client-server
     1a - clear all cache
     2 - Launch on 3001
     3 - save output5 + recorded time5
       - check URL cache-server is called
       - check URL cache content is set and correct
     4 - Launch on 3001 with REST URL not SET 2dd time
     5 - save output6 + recorded time6
     6 - output1 === output2 == output 5 === output6
       - time1 == time5 && time6 < time2
       - check the url server hasn't been called (cached in ngFactory)

 */

var path = require('path');
var chai = require('chai');
var common = require('./common/requestUrl');
var debug = require('debug')('mocha-test-server');
var testNgServer = require('./common/testLaunchNgServer');
var testWebServer = require('./common/testWebServers');
const redisUtils = require('./common/redis');

describe('Starting tests', function() {

    this.timeout(5000);


    describe('creating rest & Server Instances', () => {
        redisUtils.createRedisConfig();
    });


    describe('Testing test server connectivity',  () => {
        testWebServer.testStart();
        testWebServer.testStop();
    });

    describe('Testing ngServer connectivity', () => {
        testNgServer.testStart();
        testNgServer.testStop();
    });


    describe("JADE - E2E", () => {

        testNgServer.testStart();
        testWebServer.testStart();

        var confJade = [
            {
                prefix: 'noserver-jade',
                desc: "No Server Rendering",
                url: "http://localhost:3000",
                equals: [],
                cache: false
            },
            {
                prefix: 'server-jade',
                desc: "Server Rendering",
                url: "http://localhost:3001",
                equals: ['js-disabled', 'js-enabled'],
                cache: true
            }
        ];

        common.testDescribeURL('/Main/500', confJade);

        common.testDescribeURL('/Main', confJade);

        common.testDescribeURL('/Todo', confJade);

        common.testClosePhantomJS();

        testWebServer.testStop();
        testNgServer.testStop();

    });

/*
    describe.skip("SWIG - E2E", function() {
        testServer.testConnect();

        var confSwig = [
            {
                prefix: 'noserver-swig',
                desc: "No Server Rendering",
                url: "http://127.0.0.1:3003",
                equals: [],
                cache: false
            },
            {
                prefix: 'server-swig',
                desc: "Server Rendering",
                url: "http://127.0.0.1:3004",
                equals: ['js-disabled', 'js-enabled'],
                cache: true
            },
            {
                prefix: 'server-middleware-swig',
                desc: "Server MiddleWare Rendering",
                url: "http://127.0.0.1:3005",
                equals: ['js-disabled', 'js-enabled'],
                cache: true
            }
        ];

        common.describeURL('/Main/500', confSwig);

        common.describeURL('/Todo', confSwig);

        common.closePhantomJS();

        testServer.testClose();
    })
*/
});

