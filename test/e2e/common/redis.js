"use strict";

var redisCache = require('redis-url-cache');
var yaml = require('js-yaml');
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');

const debug = require('debug')('test');


const serverConfig = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname + './../../../bin/configYaml/serverConfig.yml')), 'utf-8');

const redisConfig = serverConfig.redisConfig;


const serverCacheRules = redisCache.CacheEngineCB.helpers.unserializeCacheRules(yaml.safeLoad(fs.readFileSync(path.resolve(__dirname + './../../../bin/configYaml/serverCacheRules.yml')), 'utf-8'));

const slimerRestcacheRules = redisCache.CacheEngineCB.helpers.unserializeCacheRules(yaml.safeLoad(fs.readFileSync(path.resolve(__dirname + './../../../bin/configYaml/slimerRestCacheRules.yml')), 'utf-8'));


console.log('Server Cache Rules = ');
console.log(serverCacheRules);
console.log('slimerRestcacheRules Cache Rules = ');
console.log(slimerRestcacheRules);


module.exports.createRedisConfig = () => {

    it('creates the instance SLIMER_REST ', done => {
        redisCache.CacheCreator.createCache('SLIMER_REST', true, redisConfig, slimerRestcacheRules, (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('should connect to the instance SLIMER_REST', (done) => {
        new redisCache.Instance('SLIMER_REST', redisConfig, {}, function (err) {
            if (err) return done(err);
            done();
        });
    });

    it('creates the instance SERVER ', done => {
        redisCache.CacheCreator.createCache('SERVER', true, redisConfig, serverCacheRules, (err) => {
            if (err) return done(err);
            done();
        });
    });

    it('should connect to the instance SERVER', (done) => {
        new redisCache.Instance('SLIMER_REST', redisConfig, {}, function (err) {
            if (err) return done(err);
            done();
        });
    });
};

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

