"use strict";

var redisCache = require('redis-url-cache').RedisUrlCache;
var yaml = require('js-yaml');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
const debug = require('debug')('test');

const serverConfig = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname + './../../../bin/configYaml/serverConfig.yml')), 'utf-8');

const redisConfig = serverConfig.redisConfig;


module.exports.clearURLs = (instanceName, urls) => {

    describe(`Clear URL cache`, () => {

        let instance, cacheEngine;

        it(`connect to redis-url-cache for ${instanceName}`, (done) => {
            instance = new redisCache.Instance(instanceName, redisConfig, {}, function(err) {
                if(err) {
                    debug(err);
                    return done(err);
                }
                cacheEngine = new redisCache.CacheEngineCB('A', instance);
                done();
            })
        });

        urls.forEach((url) => {
            it(`clears the cache for url ${url}`, (done) => {
                cacheEngine.url(url).delete( (err) => {
                    if(err && err !=='url is not cached') {
                        return done(err);
                    }
                    done();
                })
            });
        });
    });
};

