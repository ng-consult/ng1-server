'use strict';

var path = require('path');
var chai = require('chai');
var common = require('./common/requestUrl');
var debug = require('debug')('mocha-test-server');

var expect = chai.expect;

var testServer = require('./common/testServer');

describe('Starting tests', function() {

    this.timeout(5000);

    describe('Testing test server connectivity', function () {
        testServer.testConnect();
        testServer.testClose();
    });

    describe("JADE - E2E", function () {


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
            },
            {
                prefix: 'server-middleware-jade',
                desc: "Server MiddleWare Rendering",
                url: "http://127.0.0.1:3002",
                equals: ['js-disabled', 'js-enabled'],
                cache: true
            }
        ];

        common.describeURL('/Main/500', confJade);

        common.describeURL('/Todo', confJade);

        common.closePhantomJS();

        testServer.testClose();

    });

    describe("SWIG - E2E", function() {
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

});

