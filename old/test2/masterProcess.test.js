"use strict";
var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var sinon = require('sinon');
var RedisUrlCache = require('redis-url-cache').RedisUrlCache;
var chai = require('chai');
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
const util = require('util');
const EventEmitter = require('events');

var expect = chai.expect;
chai.use(sinonChai);


var MasterProcess = require('./../dist/src2/index').ngServer.MasterProcess;
var ServerLog =  require('./../dist/src2/index').ngServer.ServerLog;

var validConfigBasePath = path.resolve(__dirname + '/configSample');

describe('Master Process testing', function() {

    describe('constructor', function() {

        var invalidConfigBasePath = '/root/config';
        var configFiles = ['serverConfig.js', 'serverRenderRules.js', 'serverCacheRules.js', 'restCacheRules.js', 'SlimerRestCacheRules.js'];

        beforeEach(function() {
            //creates folders where one of each config Files is missing
            for(var i=0; i< configFiles.length; i++) {
                fs.ensureDirSync(validConfigBasePath + i);
                for(var j=0; j< configFiles.length; j++) {
                    //skip the creation of this file
                    if(i!==j) {
                        fs.writeFileSync(path.join(validConfigBasePath + i, configFiles[j]), '', 'utf-8');
                    }
                }
            }
        });

        afterEach(function() {
            for(var i=0; i< configFiles.length; i++) {
                fs.removeSync(validConfigBasePath + i);
            }
        });

        it('should construct correctly with correct config path', function() {
            expect(function(){new MasterProcess(validConfigBasePath)}).to.not.throw;

        });

        it('should throw error when incorrect config path', function() {
            expect(function(){new MasterProcess(invalidConfigBasePath)}).to.throw("The config dir doesn't exists "+invalidConfigBasePath);
            for(var i=0; i< configFiles; i++) {
                expect(function(){new MasterProcess(validConfigBasePath + i)}).to.throw('The config file ' + configFiles[i] + ' doesnt exists');
            }
        });

    });

    describe('Starting', function() {
        var masterProcess,
            CacheRuleCreatorStub ,
            launchSocketServerStub,
            ServerLogStub ,
            launchCacheServerStub,
            CacheCreatorStub;

        describe('CacheRuleCreator fails()', function() {


            before(function() {
                masterProcess = new MasterProcess(validConfigBasePath);

                CacheRuleCreatorStub = sinon.stub(RedisUrlCache.CacheRulesCreator, 'createCache');

                ServerLogStub = sinon.stub(masterProcess.serverLog, 'log');

                launchSocketServerStub = sinon.stub(masterProcess, 'launchSocketServer');
                launchCacheServerStub = sinon.stub(masterProcess, 'launchCacheServer');

            });

            after(function() {
                launchSocketServerStub.restore();
                launchCacheServerStub.restore();
                CacheRuleCreatorStub.restore();
                ServerLogStub.restore();
            });

            ['SERVER', 'REST', 'SLIMER'].forEach(function(instanceName) {

                it('start should throw a specific error when initiating CacheRuleCreator for ' + instanceName, function () {
                    CacheRuleCreatorStub.withArgs(instanceName).callsArgWith(4, 'stub-crc-error');
                    expect(function () {
                        masterProcess.start()
                    }).to.throw('stub-crc-error');
                    expect(ServerLogStub).to.have.been.called;
                    expect(launchSocketServerStub).not.to.have.been.called;
                    expect(launchCacheServerStub).not.to.have.been.called;
                });
            });

        });

        describe('CacheRuleCreator ok()', function() {
            before(function() {
                masterProcess = new MasterProcess(validConfigBasePath);
                ServerLogStub = sinon.stub(masterProcess.serverLog, 'log');

                launchSocketServerStub = sinon.stub(masterProcess, 'launchSocketServer', function(){});
                launchCacheServerStub = sinon.stub(masterProcess, 'launchCacheServer', function(){});

                //CacheCreatorStub = sinon.stub(RedisUrlCache.CacheRulesCreator, 'createCache');
            });

            it('start should call launchSocketServer and launchCacheServer', function (done) {

                //CacheRuleCreatorStub.callsArgWith(4, null);

                expect(function () {
                    masterProcess.start()
                }).to.not.throw;

                masterProcess.start();

                setTimeout(function() {
                    expect(ServerLogStub).not.to.have.been.called;
                    expect(launchSocketServerStub).to.have.been.called;
                    expect(launchCacheServerStub).to.have.been.called;
                    done();
                }, 100);

            });

            after(function() {
                //CacheCreatorStub.restore();
                launchSocketServerStub.restore();
                launchCacheServerStub.restore();
                ServerLogStub.restore();
            });
        });

        describe('Launching SocketServer', function() {
            var spawnStub,
                ServerLogStub,
                spawned,
                spawnMock,
                launchSocketServerSpy,
                socketBin = path.resolve(__dirname + './../dist/' + 'bin/socketServer.js');

            before(function() {
                masterProcess = new MasterProcess(validConfigBasePath);
                ServerLogStub = sinon.spy(masterProcess.serverLog, 'log');

                launchSocketServerSpy = sinon.spy(masterProcess, 'launchSocketServer');


                var spawnMock = function() {
                     EventEmitter.call(this);
                };

                var stderr = function() {
                    EventEmitter.call(this);
                };

                var stdout = function() {
                    EventEmitter.call(this);
                };

                util.inherits(spawnMock, EventEmitter);
                util.inherits(stderr, EventEmitter);
                util.inherits(stdout, EventEmitter);

                stderr.prototype.setEncoding = function(){}
                stdout.prototype.setEncoding = function(){}

                spawnMock.prototype.stderr = new stderr();
                spawnMock.prototype.stdout = new stdout();

                spawned = new spawnMock();
                spawned.setMaxListeners(100);
                

                spawnStub = sinon.stub(child_process, 'spawn', function(script, args) {
                    return spawned;
                });
                //spawnSpy = sinon.spy(child_process, 'spawn');

            });
            it('should call spawn() with the correct arguments', function(done) {

                masterProcess.start();
                setTimeout(function() {
                    var spyCall = child_process.spawn.getCall(0);
                    expect(spawnStub).to.have.been.calledWith(socketBin, [validConfigBasePath]);
                    done();
                }, 500);
            });

            it('should log on.error and on.close', function(done) {

                masterProcess.start();
                setTimeout(function() {
                    spawned.emit('error', 'errorMsg');
                    expect(ServerLogStub).to.have.been.calledWith('server', [ 'Socket Server error' ], { err: 'errorMsg' });
                    spawned.emit('close', 1, 'signal');
                    expect(ServerLogStub).to.have.been.calledWith('server', [ 'Socket Server crashed.' ], { code: 1, signal: 'signal' });
                    spawned.emit('close', 0, 'signal');
                    expect(ServerLogStub).to.have.been.calledWith('server', [ 'Socket Server exited gracefully.' ], { code: 0, signal: 'signal' });
                    done();
                }, 500);
            });

            it('should log on stderr.on(data)', function(done) {
                masterProcess.start();
                setTimeout(function() {
                    spawned.stderr.emit('data', 'errorMsg');
                    expect(ServerLogStub).to.have.been.calledWith('server', ['Socket server ouputs error'], { err: 'errorMsg' });
                    done();
                }, 500);
            });

            it('should re-launchSocketServer on(data)', function(done) {
                masterProcess.start();

                setTimeout(function() {
                    expect(launchSocketServerStub).to.have.been.calledOnce;
                    spawned.emit('close', 1, 'signal');

                    setTimeout(function() {
                        expect(launchSocketServerStub).to.have.been.calledTwice;
                        expect(launchSocketServerStub).to.have.been.calledOnce;
                        done();
                    }, 600)

                }, 100);


            });


            after(function() {
                launchSocketServerSpy.restore();
                spawnStub.restore();
                ServerLogStub.restore();
            })
        });

        /*
        describe('CacheRuleCreator.importRules()', function() {
            before(function() {
                masterProcess = new MasterProcess(validConfigBasePath);
                CacheRuleImportRuleStub.SERVER = sinon.mock(masterProcess.serverCacheRulesCreator);
                CacheRuleImportRuleStub.REST = sinon.mock(masterProcess.restCacheRulesCreator);
                CacheRuleImportRuleStub.SLIMER = sinon.mock(masterProcess.slimerCacheRulesCreator);
                ServerLogStub = sinon.stub(masterProcess.serverLog, 'log');
            });
            ['SERVER', 'REST', 'SLIMER'].forEach(function(instanceName) {
                it('start should throw a specific error when importing Rules for ' + instanceName, function () {
                    //CacheRuleImportRuleStub[instanceName].callsArgWith(1, 'stub-ir-error');
                    CacheRuleImportRuleStub[instanceName].expects('importRules').callsArgWith(1, 'stub-ir-error');

                    expect(function () {
                        masterProcess.start()
                    }).to.throw('stub-ir-error');
                    CacheRuleImportRuleStub[instanceName].verify();
                    //expect(ServerLogStub).to.have.been.called;
                });
            });
            after(function() {
                CacheRuleImportRuleStub['SERVER'].restore();
                CacheRuleImportRuleStub['REST'].restore();
                CacheRuleImportRuleStub['SLIMER'].restore();

                ServerLogStub.restore();
            });

        });*/


    });
});
