"use strict";
var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs-extra');
var AngularJsServer = require('./../../dist/AngularServerRenderer');

var server, config;

describe('Config file', function () {

    beforeEach(function () {
        server = new AngularJsServer();
        config = server.config;
    });


    it('should have the correct default values', function () {

        //server
        expect(config.server.getDomain()).to.eql('http://localhost');
        expect(config.server.getTimeout()).to.eql(10000);
        expect(config.server.getDebug()).to.eql(true);

        //render
        expect(config.render.getStrategy()).to.eql('never');
        expect(config.render.getRules()).to.eql([]);

        //cache
        expect(config.cache.getDefault()).to.eql('never');
        expect(config.cache.getAlwaysRules()).to.eql([]);
        expect(config.cache.getNeverRules()).to.eql([]);
        expect(config.cache.getMaxAgeRules()).to.eql([]);

        //restcache
        expect(config.restCache.getDefault()).to.eql('never');
        expect(config.restCache.getAlwaysRules()).to.eql([]);
        expect(config.restCache.getNeverRules()).to.eql([]);
        expect(config.restCache.getMaxAgeRules()).to.eql([]);


        //log
        expect(config.log.getBasePath()).to.eql(path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/log/angular.js-server'));
        ['warn', 'log', 'info', 'debug', 'error'].forEach((log)=> {
            expect(config.log.getDefinition(log)).to.eql({enabled: true, stack: false});
        });
        expect(config.log.getFileServerName()).to.eql('angular-server.log');

    });


    describe('set and get config data', function () {


        describe('ServerConfig', function () {

            it('should import the config ok', function () {
                var serverConfig = {
                    domain: 'http://localhostaaa/',
                    port: 8080,
                    timeout: 100,
                    debug: false,
                    base: '/aaa'
                };

                config.server.importConfig(serverConfig);
                expect(config.server.getDomain()).to.eql(serverConfig.domain);
                expect(config.server.getTimeout()).to.eql(serverConfig.timeout);
                expect(config.server.getDebug()).to.eql(serverConfig.debug);
                expect(config.server.getBase()).to.eql(serverConfig.base);


            });

            it('should set the server config ok', function () {

                var serverConfig = {
                    domain: 'http://localhost/',
                    timeout: 10000,
                    debug: true,
                    base: '/'
                };
                config.server.setDomain(serverConfig.domain);
                expect(config.server.getDomain()).to.eql(serverConfig.domain);


                config.server.setTimeout(serverConfig.timeout);
                expect(config.server.getTimeout()).to.eql(serverConfig.timeout);

                config.server.setDebug(serverConfig.debug);
                expect(config.server.getDebug()).to.eql(serverConfig.debug);

                config.server.setBase(serverConfig.base);
                expect(config.server.getBase()).to.eql(serverConfig.base);

            });


            it('Server config Should throw Errors when assigning wrong values', function () {

                var serverConfig = {
                    domain: null,
                    timeout: null,
                    debug: null,
                    base: null
                };

                expect(function () {
                    config.server.setDomain(serverConfig.domain)
                }).to.throw;
                expect(function () {
                    config.server.setTimeout(serverConfig.timeout)
                }).to.throw;
                expect(function () {
                    config.server.setDebug(serverConfig.debug)
                }).to.throw;
                expect(function () {
                    config.server.setBase(serverConfig.base)
                }).to.throw;
                expect(function () {
                    config.render.importConfig(serverConfig)
                }).to.throw;


            });
        });

        describe('LogConfig', function () {
            it('should set the log config ok', function () {

                //server
                var configSample = {
                    dir: path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/testfolder_to_be_deleted'),
                    log: {
                        enabled: false,
                        stack: false
                    },
                    debug: {
                        enabled: false,
                        stack: false
                    },
                    warn: {
                        enabled: false,
                        stack: false
                    },
                    info: {
                        enabled: false,
                        stack: false
                    },
                    error: {
                        enabled: false,
                        stack: false
                    },
                    serverLogFile: 'whatever'
                };

                config.log.setBasePath(configSample.dir);
                expect(config.log.getBasePath()).to.eql(configSample.dir);

                ['log', 'info', 'warn', 'error', 'debug'].forEach(function (item) {
                    config.log.setDefinition(item, configSample[item].enabled, configSample[item].stack);
                    expect(config.log.getDefinition(item)).eql(configSample[item]);
                });

                config.log.setFileServerName(configSample.serverLogFile);
                expect(config.log.getFileServerName()).equal(configSample.serverLogFile);

                ['log', 'info', 'warn', 'error', 'debug'].forEach(function (item) {
                    expect(config.log.getLogPath(item)).eql(configSample.dir + '/' + item + '.log');
                });

                expect(config.log.getLogServerPath()).eql(path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/testfolder_to_be_deleted' + '/whatever.log'));

                expect(config.log.getConfig()).eql(configSample);

                fs.rmdir(path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/testfolder_to_be_deleted'));

            });

            it('Should import config just fine', function () {
                var configSample = {
                    dir: path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/AAAAA_to_be_deleted'),
                    log: {
                        enabled: true,
                        stack: true
                    },
                    debug: {
                        enabled: true,
                        stack: true
                    },
                    warn: {
                        enabled: true,
                        stack: true
                    },
                    info: {
                        enabled: true,
                        stack: true
                    },
                    error: {
                        enabled: true,
                        stack: true
                    },
                    serverLogFile: 'another'
                };

                config.log.importConfig(configSample);

                expect(config.log.getBasePath()).to.eql(configSample.dir);

                ['log', 'info', 'warn', 'error', 'debug'].forEach(function (item) {
                    expect(config.log.getDefinition(item)).eql(configSample[item]);
                });

                expect(config.log.getFileServerName()).equal(configSample.serverLogFile);

                ['log', 'info', 'warn', 'error', 'debug'].forEach(function (item) {
                    expect(config.log.getLogPath(item)).eql(configSample.dir + '/' + item + '.log');
                });

                expect(config.log.getLogServerPath()).eql(path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/AAAAA_to_be_deleted' + '/another.log'));

                expect(config.log.getConfig()).eql(configSample);

                fs.rmdir(path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/AAAAA_to_be_deleted'));

            });

            it('Should complain about invalid inputs', function () {

                var configSample = {
                    dirname: path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/testfolder_to_be_deleted'),
                    log: {
                        enabled: 'aaa',
                        stack: false
                    },
                    debug: {
                        enabled: false,
                        stack: 'bbb'
                    },
                    warn: {
                        enabled: null,
                        stack: false
                    },
                    info: {
                        enabled: false,
                        stack: /aaa/
                    },
                    error: {
                        stack: null
                    },
                    serverLogFile: {}
                };


                expect(function () {
                    config.log.setBasePath(configSample.dir);
                }).to.throw;

                ['log', 'info', 'warn', 'error', 'debug'].forEach(function (item) {
                    expect(function () {
                        config.log.setDefinition(item, configSample[item].enabled, configSample[item].stack);
                    }).to.throw;
                });

                expect(function () {
                    config.log.setFileServerName(configSample.serverLogFile);
                }).to.throw;


                expect(function () {
                    config.log.importConfig(configSample)
                }).to.throw;
            });


        });

        describe('Render Regex rules correctly', function () {

            it('Render rules with wrong values should throw errors', function () {

                var invalidParams = [{}, 'string', null, new Object()];

                invalidParams.forEach(function (item) {
                    expect(function () {
                        config.render.addRule(item);
                    }).to.throw;
                    expect(function () {
                        config.render.hasRule(item)
                    }).to.throw;
                    expect(function () {
                        config.render.removeRule(item)
                    }).to.throw;
                });
                expect(function () {
                    config.render.setStrategy('sometimes');
                }).to.throw;

                var renderConfig = {
                    strategy: 'always',
                    rules: [
                        'aaa'
                    ]
                };
                expect(function () {
                    config.render.importConfig(renderConfig);
                }).to.throw;

                renderConfig = {
                    strategy: 'sometimes',
                    rules: [
                        /aaa/
                    ]
                };
                expect(function () {
                    config.render.importConfig(renderConfig);
                }).to.throw;

            });

            it('Should import config ok', function () {
                var renderConfig = {
                    strategy: 'always',
                    rules: [
                        /aaa/,
                        /bbb/
                    ]
                };

                config.render.importConfig(renderConfig);
                expect(config.render.getStrategy()).eql('always');
                expect(config.render.getRules()).to.eql([/aaa/, /bbb/]);
            });

            it('Render rules', function () {

                config.render.setStrategy('never');
                expect(config.render.getStrategy()).eql('never');

                expect(config.render.getRules()).to.eql([]);

                config.render.addRule(/aaa/);
                expect(config.render.getRules()).to.eql([/aaa/]);

                expect(config.render.hasRule(/aaa/)).eql(true);

                config.render.removeRule(/aaa/);
                expect(config.render.getRules()).to.eql([]);

            });

        });

        describe('CacheRules & REstCache Rules', function () {


            it('Cache Rules Set and Get', function () {

                expect(config.cache.getMaxAgeRules()).to.eql([]);
                config.cache.addMaxAgeRule(/aaa/, 50);
                expect(config.cache.getMaxAgeRules()).to.eql([{regex: /aaa/, maxAge: 50}]);
                config.cache.removeMaxAgeRule(/aaa/);
                expect(config.cache.getMaxAgeRules()).to.eql([]);

                expect(config.cache.getNeverRules()).to.eql([]);
                config.cache.addNeverRule(/aaa/);
                expect(config.cache.getNeverRules()).to.eql([{regex: /aaa/}]);
                config.cache.removeNeverRule(/aaa/);
                expect(config.cache.getNeverRules()).to.eql([]);


                expect(config.cache.getAlwaysRules()).to.eql([]);
                config.cache.addAlwaysRule(/aaa/);
                expect(config.cache.getAlwaysRules()).to.eql([{regex: /aaa/}]);
                config.cache.removeAlwaysRule(/aaa/);
                expect(config.cache.getAlwaysRules()).to.eql([]);

            });


            it('imports config file ok', function () {
                var cacheConfig = {
                    default: 'never',
                    maxAge: [{regex: /aaa/, maxAge: 10}],
                    never: [{regex: /bbb/}],
                    always: [{regex: /ccc/}]
                };

                config.cache.importConfig(cacheConfig);
                expect(config.cache.getAlwaysRules()).eql([{regex: /ccc/}]);
                expect(config.cache.getNeverRules()).eql([{regex: /bbb/}]);
                expect(config.cache.getMaxAgeRules()).eql([{regex: /aaa/, maxAge: 10}]);
                expect(config.cache.getDefault()).eql('never');

            });

            it('Cache Rules Invalid setters', function () {

                var invalidParams = [{}, 'string', null, new Object()];

                invalidParams.forEach(function (item) {
                    //expect(function () {config.cache.addMaxAgeRule(item, item);}).to.throw;
                    expect(function () {
                        config.cache.removeMaxAgeRule(item);
                    }).to.throw;
                    expect(function () {
                        config.cache.addNeverRule(item);
                    }).to.throw;
                    expect(function () {
                        config.cache.removeNeverRule(item);
                    }).to.throw;
                    expect(function () {
                        config.cache.addAlwaysRule(item);
                    }).to.throw;
                    expect(function () {
                        config.cache.removeAlwaysRule(item);
                    }).to.throw;
                });
            });

            it('RestCache rules', function () {
                expect(config.restCache.getMaxAgeRules()).to.eql([]);
                config.restCache.addMaxAgeRule(/aaa/, 50);
                expect(config.restCache.getMaxAgeRules()).to.eql([{regex: /aaa/, maxAge: 50}]);
                config.restCache.removeMaxAgeRule(/aaa/);
                expect(config.restCache.getMaxAgeRules()).to.eql([]);

                expect(config.restCache.getNeverRules()).to.eql([]);
                config.restCache.addNeverRule(/aaa/);
                expect(config.restCache.getNeverRules()).to.eql([{regex: /aaa/}]);
                config.restCache.removeNeverRule(/aaa/);
                expect(config.restCache.getNeverRules()).to.eql([]);


                expect(config.restCache.getAlwaysRules()).to.eql([]);
                config.restCache.addAlwaysRule(/aaa/);
                expect(config.restCache.getAlwaysRules()).to.eql([{regex: /aaa/}]);
                config.restCache.removeAlwaysRule(/aaa/);
                expect(config.restCache.getAlwaysRules()).to.eql([]);
            });

            it('Rest Cache Rules Invalid setters', function () {

                var invalidParams = [{}, 'string', null, new Object()];

                invalidParams.forEach(function (item) {
                    //expect(function () {config.cache.addMaxAgeRule(item, item);}).to.throw;
                    expect(function () {
                        config.restCache.removeMaxAgeRule(item);
                    }).to.throw;
                    expect(function () {
                        config.restCache.addNeverRule(item);
                    }).to.throw;
                    expect(function () {
                        config.restCache.removeNeverRule(item);
                    }).to.throw;
                    expect(function () {
                        config.restCache.addAlwaysRule(item);
                    }).to.throw;
                    expect(function () {
                        config.restCache.removeAlwaysRule(item);
                    }).to.throw;
                });
            });

        });

    });

    describe('Render.shouldRender()', function () {

        it('shouldRender should return the correct values', function () {

            config.render.setStrategy('never');

            var urlMatch = 'whatever';
            var urlNoMatch = 'whot';
            var regex = /what/;

            expect(config.render.shouldRender(urlMatch)).to.eql(false);
            expect(config.render.shouldRender(urlNoMatch)).to.eql(false);

            config.render.setStrategy('always');
            expect(config.render.shouldRender(urlMatch)).to.eql(true);
            expect(config.render.shouldRender(urlNoMatch)).to.eql(true);

            config.render.addRule(regex);

            config.render.setStrategy('include');
            expect(config.render.shouldRender(urlMatch)).to.eql(true);
            expect(config.render.shouldRender(urlNoMatch)).to.eql(false);

            config.render.setStrategy('exclude');
            expect(config.render.shouldRender(urlMatch)).to.eql(false);
            expect(config.render.shouldRender(urlNoMatch)).to.eql(true);

        });
    });
});
