"use strict";
var path = require('path');
var chai = require('chai');
var common = require('./common/requestUrl');
var debug = require('debug')('mocha-test-cache-server');
var testNgServer = require('./common/testLaunchNgServer');


describe(`Launching ngServer`, () => {
    testNgServer.testStart();
});

describe(`Querying URLs that shouldn't be cached`, () => {

    let timer1;
    let timer2;

    describe(`a URL wth a a strange invalid header `, () => {
        it(`retrieve it directly via request() should fail`, done => {

        });

        it(`should not load the URL`, (done) => {

        });
    });

    describe(`an invalid URL`, () => {

    });

    describe(`a normal URL: `, () => {

        it(`retrieve it directly via request()`, done => {

        });

        it(`should load the URL ok`, (done) => {

        });

        it(`headers should have headers['caching-status'] = 'NEVER'`, () => {

        });

        it(`should load the URL ok`, (done) => {

        });

        it(`headers should have headers['caching-status'] = 'NEVER'`, () => {

        });

        it(`timer1 ${timer1} should be almost equal to timer2 ${timer2}`, () {

        });

    });

});

describe(`Querying URLs that should be cached`, () => {

    describe(`a URL wth a a strange invalid header `, () => {
        it(`retrieve it directly via request() should fail`, done => {

        });

        it(`should not load the URL`, (done) => {

        });
    });

    describe(`an invalid URL`, () => {

    });

    it(`retrieve it directly via request()`, done => {

    });

    it(`should load the URL for the first time ok`, (done) => {

    });

    it(`headers should have headers['caching-status'] = 'NOT_CACHED'`, () => {

    });
    it(`headers should have headers['ngServerCached'] = 'yes'`, () => {

    });
    it(`should load the URL for the second time ok`, (done) => {

    });

    it(`headers should have headers['caching-status'] = 'CACHED'`, () => {

    });
    it(`headers should have headers['ngServerCached'] = 'yes'`, () => {

    });

    it(`timer1 ${timer1} should be much higher than timer2 ${timer2}`, () {

    });
});


describe(`DDOS ATTACK`, () => {

});


describe('Stopping server', () => {
    testNgServer.testStop();
});

