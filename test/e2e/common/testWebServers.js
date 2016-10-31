var chai = require('chai');
var debug = require('debug')('mocha-test-server');
var expect = chai.expect;

var apiServer ,
    jadeClassicServer,
    jadePreRenderServer,
    jadeMiddleWareServer,
    swigClassicServer,
    swigPreRenderServer,
    swigMiddleWareServer;

module.exports.testConnect = function() {
    describe('Starting test server', function(){

        it('Api should start', function(done) {
            apiServer = require('./../../../test-server/server/api/api-server').listen(8080, function(err) {
                if(err) { debug(err);done(err);}
                expect(err).to.be.undefined;
                done();
            });
        });

        it('Jade No server side rendering should start', function(done) {
            jadeClassicServer = require('./../../../test-server/server/jade/classic.server').listen(3000, function(err) {
                if(err) { debug(err);done(err);}
                expect(err).to.be.undefined;
                done();
            });
        });


        it('Jade server side rendering should start', function(done) {
            jadePreRenderServer = require('./../../../test-server/server/jade/pre-render.server').listen(3001, function(err) {
                if(err) { debug(err);done(err);}
                expect(err).to.be.undefined;
                done();
            });
        });


        /*
        it('Jade mddleWare should start', function(done) {
            jadeMiddleWareServer = require('./../../../test-server/server/jade/middleware.server').listen(3002, function(err) {
                if(err) { debug(err);done(err);}
                expect(err).to.be.undefined;
                done();
            });
        });

        it('Swig No server side rendering should start', function(done) {
            swigClassicServer = require('./../../../test-server/server/swig/classic.server').listen(3003, function(err) {
                if(err) { debug(err);done(err);}
                expect(err).to.be.undefined;
                done();
            });
        });


        it('Swig server side rendering should start', function(done) {
            swigPreRenderServer = require('./../../../test-server/server/swig/pre-render.server').listen(3004, function(err) {
                if(err) { debug(err);done(err);}
                expect(err).to.be.undefined;
                done();
            });
        });


        it('Swig mddleWare should start', function(done) {
            swigMiddleWareServer = require('./../../../test-server/server/swig/middleware.server').listen(3005, function(err) {
                if(err) { debug(err);done(err);}
                expect(err).to.be.undefined;
                done();
            });
        });*/

    });

};

module.exports.testClose= function() {
    describe('Stopping the test servers', function() {
        it('Should close the API server', function(done){
            apiServer.close( function(err) {
                if(err) { debug(err);done(err);}
                debug('Apiserver closed');
                done();
            })
        });
        it('Should close the Jade No server side rendering  server', function(done){
            jadeClassicServer.close( function(err) {
                if(err) { debug(err);done(err);}
                done();
            })
        });
        it('Should close the Jade server side rendering server', function(done){
            jadePreRenderServer.close( function(err) {
                if(err) { debug(err);done(err);}
                done();
            })
        });
        /*
        it('Should close the Jade mddleWare server', function(done){
            jadeMiddleWareServer.close( function(err) {
                if(err) { debug(err);done(err);}
                done();
            })
        });

        it('Should close the Swug No server side rendering  server', function(done){
            swigClassicServer.close( function(err) {
                if(err) { debug(err);done(err);}
                done();
            })
        });
        it('Should close the Swig server side rendering server', function(done){
            swigPreRenderServer.close( function(err) {
                if(err) { debug(err);done(err);}
                done();
            })
        });
        it('Should close the Swig mddleWare server', function(done){
            swigMiddleWareServer.close( function(err) {
                if(err) { debug(err);done(err);}
                done();
            })
        });*/

    });
};