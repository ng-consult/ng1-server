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
var testPage = require('./common/testPage').testPage;
var async = require('async');
var expect = chai.expect;
var q = require('q');


const redisUtils = require('./common/redis');


describe('Starting tests', function () {

    this.timeout(50000);


    describe('creating rest & Server Instances', () => {
        redisUtils.createRedisConfig();
    });


    describe('Testing start test server and ngServer connectivity', () => {
        testWebServer.testStart();
        testNgServer.testStart();
    });

    /*
     describe('testing connectivity', () => {
     testWebServer.getSuccessUrl('http://127.0.0.1:8080/products/500', [], 200, [], false);
     });
     */
    /*
     describe.only('59 seconds', () => {
     it('waits', (done) => {
     setTimeout(()=> {
     done();
     }, 49000)
     });

     });
     */

    describe('Testing stop test & ngServer connectivity', () => {
        testNgServer.testStop();
        testWebServer.testStop();
    });

    describe("Starting servers", () => {
        testNgServer.testStart();
        testWebServer.testStart();


    });


    var AppMainData   = q.defer();
    var AppTodoData   = q.defer();


    describe('JADE - E2E', () => {


        describe('Retrieving HTML & network requests, js and curl ourputs for all servers', () => {
            it('/Main', (done) => {
                common.getRequestedData('Main', (err, HTML) => {
                    if (err) return done(err);
                    AppMainData.resolve(HTML);
                    //console.log(AppData);
                    done();
                });
            });

            it('/Todo', (done) => {
                common.getRequestedData('Todo', (err, HTML) => {
                    if (err) return done(err);
                    AppTodoData.resolve(HTML);
                    console.log(HTML.noserver.cache.networkRequests);
                    console.log(HTML.noserver.nocache.networkRequests);
                    done();
                });
            });

        });


        testPage('/Main', AppMainData.promise, [
            'http://127.0.0.1:8883/get?url=http%3A%2F%2F127.0.0.1%3A8080%2Fproducts%2F2000',
            'http://127.0.0.1:8883/get?url=%2Fviews%2Fproducts.html'
        ], [
            'http://127.0.0.1:8080/products/2000',
            'http://localhost:3000/views/products.html'
        ]);

        testPage('/Todo', AppTodoData.promise, [
            'http://127.0.0.1:8883/get?url=%2Fviews%2Ftodos.html'
        ], [
            'http://localhost:3000/views/todos.html'
        ]);

        testWebServer.testStop();
        testNgServer.testStop();
    });


});

