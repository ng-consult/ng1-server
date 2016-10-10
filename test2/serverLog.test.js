"use strict";
var fs = require('fs-extra');
var path = require('path');

var ServerLog = require('./../dist/angular.js-server2').ServerLog;

describe('Testing ServerLog', function() {
    var validFolder = '/tmp/ngServerLog',
        invalidFolder = '/root/serverLog';

    describe('construfctor', function() {

        beforeEach(function() {
            fs.removeSync(validFolder);
        });

        it('should construct without error with a valid folder', function() {
            expect(function(){new ServerLog(validFolder)}).to.not.throw;
        });

        it('should raise an error with an invalid folder', function() {
            expect(function(){new ServerLog(invalidFolder)}).to.throw;
        });

        it('should create the folder when created with a valid folder', function() {
            new ServerLog(validFolder);
            expect(fs.existsSync(validFolder)).to.be.ok;
        });

    });

    describe('Writting in log files', function() {
        var serverLog;
        var testMessage = 'some log message';
        var testArrayMessage = ['some', 'log message'];
        var testArrayMessage = ['some', 'log// message'];

        var levels = {'server': 'server.log', 'error': 'error.log', 'debug': 'debug.log', 'warn': 'warn.log', 'logger': 'log.log', 'info': 'info.log'};
        beforeEach(function() {
            fs.removeSync(validFolder);
            serverLog = new ServerLog(validFolder);
        });

        for(var key in levels) {
            describe(key +' level', function() {

                it('Should write without error', function() {
                    expect(function(){serverLog.log(key, 'some message')}).to.not.throw;
                });

                it('Should write into the correct file', function() {
                    serverLog.log(key, testMessage);
                    var filepath = path.join(validFolder, levels[key]);
                    expect(fs.existsSync(filepath)).to.be.ok;
                    expect(fs.readFileSync(filepath)).to.conatin(testMessage);
                });

                it('should format message like console', function() {
                    serverLog.log(key, testArrayMessage);
                    var filepath = path.join(validFolder, levels[key]);
                    expect(fs.readFileSync(filepath)).to.conatin(testMessage);
                });
            });
        }
    })
});









