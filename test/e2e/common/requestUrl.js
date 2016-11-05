'use strict';

var phantomHelper = require('./phantomHelper')
var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
var debug = require('debug')('mocha-test');

var expect = chai.expect;

module.exports.testClosePhantomJS = function () {

    describe('Stopping PhantomJS', function () {
        it('should stop it', function (done) {
            phantomHelper.closePhantom().then( () => {
                done();
            }, (err) => {
                done(err);
            });
        });
    });
};

module.exports.testDescribeURL = function (url, conf) {

    var getFileName = function (url, prefix, name) {
        return path.join(__dirname, '/../outputs', encodeURIComponent(url), prefix + '.' + name + '.html');
    };

    describe('Creating the output directory: ', function () {
        it('Should create the directory ' + path.join(__dirname, '/../outputs', encodeURIComponent(url)), function (done) {
            try {
                fs.mkdirsSync(path.join(__dirname, '/../outputs', encodeURIComponent(url)));
                done();
            }
            catch (e) {
                done(e);
            }
        });
    });

    describe(`URL: ${url}`, function () {

        conf.forEach(function (serverData) {

            describe(serverData.desc, function () {

                it('phantom with js disabled', function (done) {

                    phantomHelper.jsDisabled(serverData.url + url).then((html) => {
                        debug('noJS received ', url);
                        fs.writeFileSync(getFileName(url, serverData.prefix, 'js-disabled'), html, 'utf-8');
                        done();
                    }, (err) => {
                        debug(err);
                        done(err);
                    }).catch( (e) => {
                        debug('excetion', e);
                        done(e);
                    });
                });

                it('phantom with js enabled - wait 4000ms', function (done) {

                    phantomHelper.jsEnabled(serverData.url + url).then( html => {
                        debug('success JS', url);
                        fs.writeFileSync(getFileName(url, serverData.prefix, 'js-enabled'), html, 'utf-8');
                        done();
                    }, err => {
                        debug(err);
                        done(err);
                    }).catch((err) =>{
                        debug(err);
                        done(err);
                    });
                });

                if (serverData.equals.length >= 2) {
                    it(serverData.equals[0] + ' should render the same HTML than ' + serverData.equals[1], function (done) {
                        try {
                            var file1 = fs.readFileSync(getFileName(url, serverData.prefix, serverData.equals[0]), 'utf-8').trim();
                            var file2 = fs.readFileSync(getFileName(url, serverData.prefix, serverData.equals[1]), 'utf-8').trim();
                            expect(file1).to.equal(file2);
                            done();
                        } catch( e)  {
                            done(e);
                        }
                    });
                }

                /*
                 if(serverData.cache === true) {

                 beforeEach(function() {
                 cachedUrl = cacheEngine.url(url);
                 });

                 it('The files should have been cached by the server', function(done) {
                 cachedUrl.has().then(function(cached) {
                 expect(cached).to.be.ok;
                 done();
                 }, function(e) {
                 debug('cachedURL = ', cachedUrl);
                 done(e);
                 }).catch(function(err){
                 done(err);
                 });
                 });

                 it('The server cached file should match phantom.js-enabled\'s output', function(done) {

                 try {
                 var phantomJSHtml = fs.readFileSync( getFileName(url, serverData.prefix, 'js-enabled'), 'utf-8').trim();
                 cachedUrl.get().then(function(content) {
                 expect(tidy(content).trim()).to.eql(phantomJSHtml);
                 done();
                 }, function(err) {
                 done(err);
                 }).catch(function(err) {
                 done(err)
                 });

                 } catch(e) {
                 done(e);
                 }

                 });

                 it('We remove the server\'s cached file', function(done) {
                 cachedUrl.delete().then(function(removed) {
                 expect(removed).eql(true);
                 done();
                 }, function(err){
                 done(err);
                 })
                 });

                 };*/

                it('Should remove test files ok', function (done) {
                    try {
                        fs.unlinkSync(getFileName(url, serverData.prefix, 'js-disabled'));
                        fs.unlinkSync(getFileName(url, serverData.prefix, 'js-enabled'));
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });
        });
    });

};