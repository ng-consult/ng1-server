'use strict';
var test = require('tape');
//var test = require('tape-expect');
var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var sinon = require('sinon');
var RedisUrlCache = require('redis-url-cache').RedisUrlCache;
const util = require('util');
const EventEmitter = require('events');


var MasterProcess = require('./../dist/src2/index').ngServer.MasterProcess;
var ServerLog =  require('./../dist/src2/index').ngServer.ServerLog;

var validConfigBasePath = path.resolve(__dirname + '/configSample');
var invalidConfigBasePath = '/root/config';
var configFiles = ['serverConfig.js', 'serverRenderRules.js', 'serverCacheRules.js', 'restCacheRules.js', 'slimerCacheRules.js'];


test('A1', function(assert) {
    assert.pass('this test pass');

    assert.end();
});
test('A2', function(assert) {

    assert.pass('This test should fail');
    assert.equal(1, 1);
    //t.expect(1).eql(1);
    assert.end();
});

var setupConstructor =  () => {
    for (let i = 0; i < configFiles.length; i++) {
        fs.ensureDirSync(validConfigBasePath + i);
        for (let j = 0; j < configFiles.length; j++) {
            //skip the creation of this file
            if (i !== j) {
                fs.writeFileSync(path.join(validConfigBasePath + i, configFiles[j]), '', 'utf-8');
            }
        }
    }
};

var cleanConstructor = () => {
    for (var i = 0; i < configFiles.length; i++) {
        fs.removeSync(validConfigBasePath + i);
    }
};

const setupCacheRuleCreatorFAIL = () => {

    const masterProcess = new MasterProcess(validConfigBasePath);

    const CacheRuleCreatorStub = sinon.stub(RedisUrlCache.CacheRulesCreator, 'createCache');

    const ServerLogStub = sinon.stub(masterProcess.serverLog, 'log');

    const launchSocketServerStub = sinon.stub(masterProcess, 'launchSocketServer');
    const launchCacheServerStub = sinon.stub(masterProcess, 'launchCacheServer');

    return {masterProcess, CacheRuleCreatorStub, ServerLogStub, launchSocketServerStub, launchCacheServerStub};
};

const cleanCacheRuleCreatorFAIL = (CacheRuleCreatorStub, ServerLogStub, launchSocketServerStub, launchCacheServerStub) => {
    CacheRuleCreatorStub.restore();
    ServerLogStub.restore();
    launchSocketServerStub.restore();
    launchCacheServerStub.restore();
};

const setupCacheRuleCreatorOK = () => {
    const masterProcess = new MasterProcess(validConfigBasePath);
    const ServerLogStub = sinon.stub(masterProcess.serverLog, 'log');

    const launchSocketServerStub = sinon.stub(masterProcess, 'launchSocketServer', ()=>{});
    const launchCacheServerStub = sinon.stub(masterProcess, 'launchCacheServer', ()=>{});

    return {masterProcess, ServerLogStub, launchSocketServerStub, launchCacheServerStub};
};

const cleanCacheRuleCreatorOK = (ServerLogStub, launchSocketServerStub, launchCacheServerStub) => {
    ServerLogStub.restore();
    launchCacheServerStub.restore();
    launchSocketServerStub.restore();
};


test('Master Process testing', function (t)  {

    test('constructor',  function(tt)  {
        setupConstructor();

        tt.pass('should pass');

        tt.doesNotThrow( function () {
            new MasterProcess(validConfigBasePath)
        });

        tt.throws(function ()  {new MasterProcess(invalidConfigBasePath)}, "The config dir doesn't exists " + invalidConfigBasePath);

        for(var i=0; i< configFiles.length; i++) {
            tt.throws( function ()  {new MasterProcess(validConfigBasePath + i)},'The config file ' + configFiles[i] + ' doesnt exists');
        }

        cleanConstructor();

        tt.end();
    });

    test('Starting', function(tt) {

        test('CacheRuleCreator fails()',  (ttt)  => {


            ['SERVER', 'REST', 'SLIMER'].forEach( (instanceName)  => {

                test(instanceName, (tttt) => {

                    const {masterProcess, CacheRuleCreatorStub, ServerLogStub, launchSocketServerStub, launchCacheServerStub} = setupCacheRuleCreatorFAIL();

                    tttt.pass('start should throw a specific error when initiating CacheRuleCreator for ' + instanceName);

                    CacheRuleCreatorStub.withArgs(instanceName).callsArgWith(4, 'stub-crc-error');

                    tttt.throws(function () {
                        masterProcess.start()
                    },'stub-crc-error');

                    tttt.pass('Should call serverLog.log');
                    tttt.equal(ServerLogStub.callCount, 1);

                    tttt.pass('Should not call launchServerSocketServer');
                    tttt.equal(launchSocketServerStub.callCount, 0);
                    tttt.equal(launchCacheServerStub.callCount, 0);

                    cleanCacheRuleCreatorFAIL(CacheRuleCreatorStub, ServerLogStub, launchSocketServerStub, launchCacheServerStub);

                    tttt.end();

                });

            });


            ttt.end();

        });

        test('CacheRuleCreator ok()', (ttt) => {
            const {masterProcess, ServerLogStub, launchSocketServerStub, launchCacheServerStub} = setupCacheRuleCreatorOK();

            ttt.pass('start should call launchSocketServer and launchCacheServer');

            masterProcess.start();
            //CacheRuleCreatorStub.callsArgWith(4, null);

            /*ttt.doesNotThrow( () => {
                masterProcess.start();
            });
            ttt.end();
            /*
            setTimeout(function() {
                ttt.equal(ServerLogStub.callCount, 0);
                ttt.equal(launchSocketServerStub.callCount, 0);
                ttt.equal(launchCacheServerStub.callCount, 1);
                cleanCacheRuleCreator(ServerLogStub, launchSocketServerStub, launchCacheServerStub);
                ttt.end();
            }, 100);*/

            cleanCacheRuleCreatorOK(ServerLogStub, launchSocketServerStub, launchCacheServerStub);
            ttt.end();
        });

        tt.end();
    });

    t.end();

});
