'use strict';

var path = require('path');
var chai = require('chai');
var common = require('./common/requestUrl');
var debug = require('debug')('mocha-test-server');

var expect = chai.expect;

var testServer = require('./common/testServer');

describe('Starting tests', function() {

    describe.only('Testing test server connectivity', function () {
        testServer.testConnect();
        testServer.testClose();
    });


    describe.only("JADE - HTML output", function () {

        this.timeout(5000);

        testServer.testConnect();

        var confJade = [
            {
                prefix: 'noserver-jade',
                desc: "No Server Rendering",
                url: "http://127.0.0.1:3000",
                equals: [],
                cache: false
            },
            {
                prefix: 'server-jade',
                desc: "Server Rendering",
                url: "http://127.0.0.1:3001",
                equals: ['js-disabled', 'js-enabled'],
                cache: true
            }
        ];

        common.describeURL('/Main', confJade);

        //common.describeURL('/Todo', confJade);

        common.closePhantomJS();

        testServer.testClose();

    });

});
/*
serverTestEmiter.on(EVENTS.PHANTOM_TEST_READY, function(testServer) {

    debug('EVENTS.PHANTOM_TEST_READY: ');
    describe("JADE - HTML output",function() {

        this.timeout(5000);

        var confJade = [
            {
                prefix: 'noserver-jade',
                desc: "No Server Rendering",
                url: "http://127.0.0.1:3000",
                equals: [],
                cache: false
            },
            {
                prefix: 'server-jade',
                desc: "Server Rendering",
                url: "http://127.0.0.1:3001",
                equals: ['js-disabled', 'js-enabled'],
                cache: true
            }
        ];

        common.describeURL('/Main', confJade);

        //common.describeURL('/Todo', confJade);
    });


    describe("SWIG - HTML output",function() {

        var confJade = [
            {
                prefix: 'noserver-jade',
                desc: "No Server Rendering",
                url: "http://127.0.0.1:3000",
                equals: [],
                cache: false
            },
            {
                prefix: 'server-jade',
                desc: "Server Rendering",
                url: "http://127.0.0.1:3001",
                equals: ['js-disabled', 'js-enabled'],
                cache: true
            }
        ];

        common.describeURL('/Main', confJade);

        common.describeURL('/Todo', confJade);

        //common.describeURL('/Error', conf);

    });


    describe('Stoping Phantom.JS tests', function() {

        debug('PHANTOM_TEST_READY event Caught - Launching the mocha tests');

        it('The test-server script should terminate', function(done) {

            testServer.on('close', (code, signal) => {
                serverTestEmiter.emit(EVENTS.SERVER_STOPPED, code, signal);
                expect(signal).to.eql('SIGTERM');
                done();
            });

            serverTestEmiter.emit(EVENTS.KILL_SERVER, testServer);

        });
    });

});

*/

