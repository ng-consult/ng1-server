'use strict';
var test = require('tape');
//var test = require('tape-expect');
var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var sinon = require('sinon');
var RedisUrlCache = require('redis-url-cache').RedisUrlCache;
const util = require('util');


var SocketServer = require('./../dist/src2/index').ngServer.SocketServer;
var ServerLog = require('./../dist/src2/index').ngServer.ServerLog;

var validConfigBasePath = path.resolve(__dirname + '/configSample');


const setupStubsStartFail = () => {
    const socketServer = new SocketServer(validConfigBasePath);
    const launchRendererStub = sinon.stub(socketServer, 'launchRenderer', () => {
    });
    const InstanceStub = sinon.stub(RedisUrlCache, 'Instance');
    const HttpSlimerAppStub = sinon.stub(socketServer.httpSlimerApp, 'listen');

    return {socketServer, launchRendererStub, InstanceStub, HttpSlimerAppStub};
};

const cleanStubsStartFail = (launchRendererStub, InstanceStub) => {
    launchRendererStub.restore();
    InstanceStub.restore();
};


const setupStubsStartOK = (lr, is, ce, ht) => {
    const socketServer = new SocketServer(validConfigBasePath);

    const launchRendererStub = lr ? sinon.stub(socketServer, 'launchRenderer', ()=> {}) : sinon.stub(socketServer, 'launchRenderer');
    const InstanceStub = is ? sinon.stub(RedisUrlCache, 'Instance', ()=> {}) : sinon.stub(RedisUrlCache, 'Instance');
    const CacheEngineCBStub = ce ? sinon.stub(RedisUrlCache, 'CacheEngineCB', function () {}) : sinon.stub(RedisUrlCache, 'CacheEngineCB');
    const HttpSlimerAppStub = ht ? sinon.stub(socketServer.httpSlimerApp, 'listen', ()=> {}) : sinon.stub(socketServer.httpSlimerApp, 'listen');

    return {socketServer, launchRendererStub, InstanceStub, CacheEngineCBStub, HttpSlimerAppStub};
};

const cleanStubsStartOK = (launchRendererStub, InstanceStub, CacheEngineCBStub, HttpSlimerAppStub) => {
    launchRendererStub.restore();
    InstanceStub.restore();
    HttpSlimerAppStub.restore();
    CacheEngineCBStub.restore();
};

test('SocketServer testing', (t) => {


    test('constructor', (tt) => {

        tt.pass('should pass');

        tt.doesNotThrow(() => {
            new SocketServer(validConfigBasePath);
        });

        tt.end();
    });

    test('SocketServer.start() - Instance failure', (tt) => {
        const {socketServer, launchRendererStub, InstanceStub} = setupStubsStartFail(true, false, true, true);

        tt.pass('Simulating an Instance failure');

        InstanceStub.callsArgWith(3, 'instance-error');

        tt.throws(()=> {
            socketServer.start()
        }, 'instance-error');

        cleanStubsStartFail(launchRendererStub, InstanceStub);
        tt.end();
    });


    test('Socket.server.start() - all are called and stubbed', (tt) => {
        const {socketServer, launchRendererStub, InstanceStub, CacheEngineCBStub, HttpSlimerAppStub} = setupStubsStartOK(true, false, true, true);

        tt.pass('pass');

        InstanceStub.callsArgWith(3, null);

        tt.doesNotThrow(()=> {
            socketServer.start(() => {
                console.log('cb called');
                tt.equal(InstanceStub.callCount, 1);
                tt.equal(CacheEngineCBStub.callCount, 1);
                tt.equal(launchRendererStub.callCount, 1);
                tt.equal(HttpSlimerAppStub.callCount, 1);
                cleanStubsStartOK(launchRendererStub, InstanceStub, CacheEngineCBStub, HttpSlimerAppStub);
                tt.end();
            });
        });
    });

    test('Socket.server.start() - all are called and stubbed except Instance & CcaheEngine who are spied', (tt) => {
        const {socketServer, launchRendererStub, InstanceStub, CacheEngineCBStub, HttpSlimerAppStub} = setupStubsStartOK(true, false, false, true);

        tt.pass('pass');

        tt.doesNotThrow(()=> {
            socketServer.start(() => {
                console.log('cb called');
                tt.equal(InstanceStub.callCount, 1);
                tt.equal(CacheEngineCBStub.callCount, 1);
                tt.equal(launchRendererStub.callCount, 1);
                tt.equal(HttpSlimerAppStub.callCount, 1);
                cleanStubsStartOK(launchRendererStub, InstanceStub, CacheEngineCBStub, HttpSlimerAppStub);
                tt.end();
            });
        });
    });


    t.end();
});
