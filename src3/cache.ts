'use strict';
import * as bunyan from 'bunyan';
import * as path from 'path';
import {MSG, ENUM_CACHE_STATUS} from './MESSAGES';
import {RedisUrlCache} from 'redis-url-cache';
import Instance = RedisUrlCache.Instance;
import CacheEngineCB = RedisUrlCache.CacheEngineCB;
import CacheCB = RedisUrlCache.CacheCB;
import {IServerConfig, IServerRenderRule} from "./interfaces";
import CacheRules = RedisUrlCache.CacheRules;
import CallBackBooleanParam = RedisUrlCache.CallBackBooleanParam;
import CallBackStringParam = RedisUrlCache.CallBackStringParam;
import CallBackGetResultsParam = RedisUrlCache.CallBackGetResultsParam;
import RedisStorageConfig = RedisUrlCache.RedisStorageConfig;
import CacheCreator = RedisUrlCache.CacheCreator;
import ServerLog from './serverLog';


const debug = require('debug')('ngServer-Cache');

export class Cache {
    
    private renderRules: IServerRenderRule;
    private cacheRules: CacheRules;
    private serverConfig: IServerConfig;
    private logger: bunyan.Logger;

    constructor(configDir: string, cb: Function) {

        const serverConfigpath: string = path.join(configDir, 'serverConfig.js');
        this.serverConfig = require(`${serverConfigpath}`);

        const renderRulesPath: string = path.join(configDir, 'serverRenderRules.js');
        this.renderRules = require(`${renderRulesPath}`);

        const cacheRulesPath: string = path.join(configDir, 'serverCacheRules.js');
        this.cacheRules = require(`${cacheRulesPath}`);

        CacheCreator.createCache('SERVER', true, this.serverConfig.redisConfig, this.cacheRules, (err) => {
            if (err) {
                const error = new Error(err);
                this.logger.error(error);
                return cb(err);
            }
            UrlCache.loadCacheEngine(this.serverConfig.domain, 'SERVER', this.serverConfig.redisConfig, (err) => {
                if(err) {
                    const error = new Error(err);
                    this.logger.error(error);
                    return cb(err);
                }
                cb(null);
            });
        });
    }

    public checkURL(url: string, cb: Function) {
        this.logger = ServerLog.Log.child({
            script: 'Cache',
            url: url
        });
        if(!this.shouldRender(url)) {
            cb(MSG.ANSWER, { status: ENUM_CACHE_STATUS.NO_RENDER});
        } else {
            const bbb_url = new UrlCache(url);
            if(bbb_url.shouldCache()) {
                debug('Should cache');
                bbb_url.has( (err, isCached) => {
                    if(err) {
                        this.logger.error(new Error(err));
                        debug('Error happened, ', err);
                        return cb(MSG.ANSWER, {status: ENUM_CACHE_STATUS.ERROR, err: err});
                    }
                    if(!isCached) {
                        debug('is not cached');
                        return cb(MSG.ANSWER, {status: ENUM_CACHE_STATUS.RENDER_CACHE});
                    } else {
                        debug('is cached');
                        bbb_url.get( (err, result) => {
                            if(err) {
                                if(typeof err === 'string') {
                                    this.logger.error(new Error(err));
                                } else {
                                    this.logger.error(err);
                                }
                                debug('Error happened, ', err);
                                return cb(MSG.ANSWER, {status: ENUM_CACHE_STATUS.ERROR, err: err});
                            }
                            cb(MSG.ANSWER, {status: ENUM_CACHE_STATUS.HTML, html: result.content});
                        });
                    }
                });
            } else {
                debug('should not cache');
                cb(MSG.ANSWER, {status: ENUM_CACHE_STATUS.RENDER_NO_CACHE});
            }
        }
    }

    private shouldRender(url: string): boolean {
        let i, regex;
        debug('shouldRender called with url, renderConfig ', url, this.renderRules)
        switch (this.renderRules.strategy) {
            case 'never':
                return false;
            case 'always':
                return true;
            case 'include':
                for (i in this.renderRules.rules) {
                    regex = this.renderRules.rules[i];
                    if (regex.test(url)) {
                        return true;
                    }
                }
                return false;
            case 'exclude':
                for (i in this.renderRules.rules) {
                    regex = this.renderRules.rules[i];
                    if (regex.test(url)) {
                        return false;
                    }
                }
                return true;
        }
    }
}

export class UrlCache {

    private URL: CacheCB;

    static cacheEngine: CacheEngineCB;

    constructor(private url: string) {
        this.URL = UrlCache.cacheEngine.url(url);
    }

    static loadCacheEngine(defaultDomain: string, instanceName: string, redisConfig: RedisStorageConfig, cb: Function) {
        const instance = new Instance(instanceName, redisConfig, {}, (err) => {
            if(err) return cb(err);

            UrlCache.cacheEngine = new CacheEngineCB(defaultDomain, instance);
            cb(null);
        })
    }

    shouldCache(): boolean {
        return this.URL.getCategory() === 'never' ? false : true;
    }

    has(cb: CallBackBooleanParam): void {
        this.URL.has(cb);
    }

    get(cb: CallBackGetResultsParam): void {
        this.URL.get(cb);
    }

    set(content: string, extra: Object, cb:CallBackBooleanParam): void {
        this.URL.set(content, extra, false, cb);
    }
}

