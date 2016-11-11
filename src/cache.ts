'use strict';

import {MSG, ENUM_CACHE_STATUS} from './MESSAGES';
import {Instance, CacheEngineCB, CacheCB, CacheRules, CallBackBooleanParam, CallBackStringParam, CallBackGetResultsParam,RedisStorageConfig, CacheCreator} from 'redis-url-cache';
import Validators from './validators';
import ServerLog from './serverLog';
import * as bunyan from 'bunyan';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';
import {IServerConfig, IServerRenderRule} from './interfaces'
const debug = require('debug')('ngServer-Cache');

export class Cache {

    private renderRules: IServerRenderRule;
    private cacheRules: CacheRules;
    private serverConfig: IServerConfig;
    private logger: bunyan.Logger;

    constructor(configDir: string, cb: Function) {

        const serverConfigpath: string = path.join(configDir, 'serverConfig.yml');
        this.serverConfig =  yaml.load(fs.readFileSync(serverConfigpath, 'utf8'));

        const renderRulesPath: string = path.join(configDir, 'serverRenderRules.yml');
        this.renderRules = Validators.unserializeServerRules(yaml.load(fs.readFileSync(renderRulesPath, 'utf8')));

        const cacheRulesPath: string = path.join(configDir, 'serverCacheRules.yml');
        this.cacheRules =  CacheEngineCB.helpers.unserializeCacheRules(yaml.load(fs.readFileSync(cacheRulesPath, 'utf8')));

        CacheCreator.createCache('SERVER', true, this.serverConfig.redisConfig, this.cacheRules, (err) => {
            if (err) {
                debug('Some error: ', err);
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

