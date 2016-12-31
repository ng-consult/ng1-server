"use strict";

var chai = require('chai');
var debug = require('debug')('mocha-test-server');
var expect = chai.expect;

module.exports.testPage = function(URL, AppDataPromise, proxyURLs, noProxyURLs) {

    AppDataPromise.then( (AppData) => {
        describe(` ${URL}, Verification of content`, () =>{

            it('no ng1-server - no cache - results should be set', () => {
                expect(AppData.noserver.nocache.curl.length).not.eql(0);
                expect(AppData.noserver.nocache.curl).not.eql(null);
                expect(AppData.noserver.nocache.js.length).not.eql(0);
                expect(AppData.noserver.nocache.js).not.eql(null);
                expect(AppData.noserver.nocache.networkRequests.length).not.eql(0);
            });

            it('server side rendering disabled - rest cache enabled- results should be set', () => {
                expect(AppData.noserver.cache.curl.length).not.eql(0);
                expect(AppData.noserver.cache.curl).not.eql(null);
                expect(AppData.noserver.cache.js.length).not.eql(0);
                expect(AppData.noserver.cache.js).not.eql(null);
                expect(AppData.noserver.cache.networkRequests.length).not.eql(0);
            });

            it('server side rendering enabled - rest cache disabled- results should be set', () => {
                expect(AppData.server.nocache.curl.length).not.eql(0);
                expect(AppData.server.nocache.curl).not.eql(null);
                expect(AppData.server.nocache.js.length).not.eql(0);
                expect(AppData.server.nocache.js).not.eql(null);
                expect(AppData.server.nocache.networkRequests.length).not.eql(0);
            });

            it('server side rendering enabled - rest cache enabled- results should be set', () => {
                expect(AppData.server.cache.curl.length).not.eql(0);
                expect(AppData.server.cache.curl).not.eql(null);
                expect(AppData.server.cache.js.length).not.eql(0);
                expect(AppData.server.cache.js).not.eql(null);
                expect(AppData.server.cache.networkRequests.length).not.eql(0);
            });

        });


        describe(` ${URL}, All rendered and curl content rules should satisfy`, () => {

            it('RENDERED (no server + no cache) === RENDERED (server + no cache)', () => {
                expect(AppData.server.nocache.js).eql(AppData.noserver.nocache.js);
            });

            it('RENDERED (server + no cache) === RENDERED (no server + cache) ', () => {
                expect(AppData.server.nocache.js).eql(AppData.noserver.cache.js);
            });

            it('RENDERED (no server + cache) === RENDERED (server + cache) ', () => {
                expect(AppData.noserver.cache.js).eql(AppData.server.cache.js);
            });

            it('server + cache : CURL ===  RENDERED ', () => {
                expect(AppData.server.cache.js).eql(AppData.server.cache.curl);
            });

            it('server + nocache : CURL ===  RENDERED ', () => {
                expect(AppData.server.nocache.js).eql(AppData.server.nocache.curl);
            });

            it('noserver + cache : CURL !==  RENDERED ', () => {
                expect(AppData.noserver.cache.js).not.eql(AppData.noserver.cache.curl);
            });

            it('noserver + nocache : CURL !==  RENDERED ', () => {
                expect(AppData.noserver.nocache.js).not.eql(AppData.noserver.nocache.curl);
            });

        });


        describe(` ${URL}, Network Requests Checks`, () => {

            it('Server side rendered pages should not query REST endpoints neither templates', () => {

                AppData.server.nocache.networkRequests.forEach( (url) => {
                    proxyURLs.forEach( ( proxyURL) => {
                        expect(url).not.eql(proxyURL);
                    });

                    noProxyURLs.forEach( ( noProxyURL) => {
                        expect(url).not.eql(noProxyURL);
                    });
                });

                AppData.server.cache.networkRequests.forEach( (url) => {
                    proxyURLs.forEach( ( proxyURL) => {
                        expect(url).not.eql(proxyURL);
                    });

                    noProxyURLs.forEach( ( noProxyURL) => {
                        expect(url).not.eql(noProxyURL);
                    });
                });

            });

            it('With no server side rendering but Rest cache enabled, the proxy endpoint must be queried two times', () => {
                let count = 0;
                AppData.noserver.cache.networkRequests.forEach((url) => {
                    noProxyURLs.forEach( ( noProxyURL) => {
                        expect(url).not.eql(noProxyURL);
                    });

                    proxyURLs.forEach( ( proxyURL) => {
                        if(url === proxyURL) {
                            count ++;
                        }
                    });

                });
                expect(count).eql(proxyURLs.length);
            });

            it('With no server side rendering and no rest cache enabled, the web-app should query the REST endpoint and the template', () => {

                let count = 0;
                AppData.noserver.nocache.networkRequests.forEach((url) => {

                    proxyURLs.forEach( ( proxyURL) => {
                        expect(url).not.eql(proxyURL);
                    });

                    noProxyURLs.forEach( ( noProxyURL) => {
                        if(url === noProxyURL) {
                            count ++;
                        }
                    });

                });
                expect(count).eql(noProxyURLs.length);
            });
        });


    });


};
