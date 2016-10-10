'use strict';
var test = require('tape');
var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var sinon = require('sinon');
const util = require('util');
const EventEmitter = require('events');


var RendererProcess = require('./../dist/src2/index').ngServer.RendererProcess;
var ServerLog = require('./../dist/src2/index').ngServer.ServerLog;

var validConfigBasePath = path.resolve(__dirname + '/configSample');


const setupChildProcessMock = () => {

    const spawnMock = function () {
        EventEmitter.call(this);
    };

    const stderr = function () {
        EventEmitter.call(this);
    };

    const stdout = function () {
        EventEmitter.call(this);
    };

    util.inherits(spawnMock, EventEmitter);
    util.inherits(stderr, EventEmitter);
    util.inherits(stdout, EventEmitter);

    stderr.prototype.setEncoding = () => {
    }
    stdout.prototype.setEncoding = () => {
    }

    spawnMock.prototype.stderr = new stderr();
    spawnMock.prototype.stdout = new stdout();

    return new spawnMock();
};


const setupProcess = () => {
    const processMock = function () {
        EventEmitter.call(this);
    };
    const originalProcess = process;
    util.inherits(processMock, EventEmitter);
    //util.inherits(process, processMock);
    const processEvent = new processMock();

    //process.on = processEvent.on;
    //console.log(typeof process.send, typeof process.emit);
    process.send = () => {};
    //process.emit = processEvent.emit;

    const rendererProcess = new RendererProcess(validConfigBasePath);

    const processOnStub = sinon.stub(process, 'on');

    const processSendStub = sinon.spy(process, 'send');
    const renderStub = sinon.stub(rendererProcess, 'render', () => {});
    const shouldRenderStub = sinon.spy(rendererProcess, 'shouldRender');
    const sendStub = sinon.stub(rendererProcess, 'send', () => {});


    return {originalProcess, rendererProcess, process, processOnStub, processSendStub, renderStub, shouldRenderStub, sendStub};
};

const clearProcess = (originalProcess, processOnStub, processSendStub, renderStub, shouldRenderStub, sendStub) => {
    process = originalProcess;
    processOnStub.restore();
    processSendStub.restore();
    renderStub.restore();
    shouldRenderStub.restore();
    sendStub.restore();
};

const clearChildProcessMock = (spawn) => {
    spawn.removeAllListeners();
};

test('Testing RendererProcess', (t) => {
    test('constructor', (tt) => {

        tt.doesNotThrow(()=> {
            new RendererProcess(validConfigBasePath);
        });
        tt.end();
    });

    test('starting', (tt) => {

        test('always strategy', (ttt) => {
            const {originalProcess, rendererProcess, process, processOnStub, processSendStub, renderStub, shouldRenderStub, sendStub} = setupProcess();

            processOnStub.callsArgWith(1, {url: 'anything'});
            rendererProcess.start();

            tt.equal(processOnStub.callCount, 1);
            tt.equal(shouldRenderStub.callCount, 1);
            tt.equal(renderStub.callCount, 1);
            tt.equal(processSendStub.callCount, 0);

            clearProcess(originalProcess, processOnStub, processSendStub, renderStub, shouldRenderStub, sendStub);

            ttt.end();
        });

        test('never strategy', (ttt) => {
            const {originalProcess, rendererProcess, process, processOnStub, processSendStub, renderStub, shouldRenderStub, sendStub} = setupProcess();

            rendererProcess.renderConfig.strategy = 'never';

            console.log(rendererProcess.renderConfig);

            processOnStub.callsArgWith(1, {url: 'anything'});
            rendererProcess.start();

            tt.equal(processOnStub.callCount, 1);
            tt.equal(shouldRenderStub.callCount, 1);
            tt.equal(renderStub.callCount, 0);
            tt.equal(processSendStub.callCount, 1);

            

            clearProcess(originalProcess, processOnStub, processSendStub, renderStub, shouldRenderStub, sendStub);

            ttt.end();
        });


        tt.end();
    });

    t.end();
});
