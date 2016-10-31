"use strict";
const chai = require('chai');
const debug = require('debug')('mocha-test-server');
const expect = chai.expect;
const path  = require('path');
const yaml = require('js-yaml');
const net = require('net');
const fs = require('fs-extra');

const Master = require('./../../../dist/ng-server');
const configPath = path.resolve(__dirname + './../../../bin/configYaml');
const serverConfig = yaml.safeLoad(fs.readFileSync(path.join(configPath, 'serverConfig.yml'), 'utf8'));


const master = new Master(configPath);


const portInUse = (port, callback) => {
    let server = net.createServer((socket) => {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });

    server.listen(port, '127.0.0.1');
    server.on('error', function (e) {
        callback(true);
    });
    server.on('listening', function (e) {
        server.close();
        callback(false);
    });
};

module.exports.testStart = () => {

    describe("starting the server", ()=> {
        it('should start', (done) => {
            master.start( (err) => {
                if(err) return done(err);
                done();
            });
        });
    });

    describe('all ports should be opened', () => {

        it('waits 1900ms', (done) => {
            setTimeout(()=> {
                done();
            }, 1900);
        });

        it('port for Bridge_1', (done) => {
            portInUse(serverConfig.socketServers.ccc_1.port, (res) => {
                expect(res).eql(true);
                done();
            });
        });
        it('port for Bridge_2', (done) => {
            portInUse(serverConfig.socketServers.ccc_2.port, (res) => {
                expect(res).eql(true);
                done();
            });
        });
        it('port for CacheServer', (done) => {
            portInUse(serverConfig.socketServers.fff.port, (res) => {
                expect(res).eql(true);
                done();
            });
        });
    });
};



module.exports.testStop = () => {
    describe('Stopping the servers', () => {
        it('shoudl stop the server ok', (done)=> {
            master.stop();
            done();
        });
    });


    describe('all ports should be closed', () => {
        it('waits 1900ms', (done) => {
            setTimeout(()=> {
                done();
            }, 1900);
        });

        it('port for Bridge_1', (done) => {
            portInUse(serverConfig.socketServers.ccc_1.port, (res) => {
                expect(res).eql(false);
                done();
            });
        });
        it('port for Bridge_2', (done) => {
            portInUse(serverConfig.socketServers.ccc_2.port, (res) => {
                expect(res).eql(false);
                done();
            });
        });
        it('port for CacheServer', (done) => {
            portInUse(serverConfig.socketServers.fff.port, (res) => {
                expect(res).eql(false);
                done();
            });
        });
    });
};

