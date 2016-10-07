import {CacheEngineCB, CacheRules, RedisStorageConfig,  CacheRulesCreator, Instance}  from 'redis-url-cache';
import Helpers from './../Helpers';
import * as dbug from 'debug';
var debug = dbug('angular.js-server');
import {EventEmitter} from 'events';


export default class CacheConfig{

    private cache: CacheEngineCB;

    private eventEmitter: EventEmitter;

    constructor(domain: string, instanceName: string, rules: CacheRules, storageConfig: RedisStorageConfig, cb: Function) {
        debug('building CacheConfig', domain, rules);

        new CacheRulesCreator(instanceName, storageConfig, (err, creator) => {
            if (err) return cb(err);
            creator.importRules(rules, (err) => {
                if(err) {
                    switch(err) {
                        case 'A CacheRule definition already exists for this instance':
                            break;
                        default:
                            return cb(err);
                    }
                }
                const instance = new Instance(instanceName, storageConfig, {}, err => {
                    if(err) return cb(err);
                    cb(null, new CacheEngineCB(domain, instance));
                });
            });
        });
    }

    getCacheEngine(): CacheEngineCB {
        return this.cache;
    }
}