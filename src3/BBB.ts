'use strict';

import * as io from 'socket.io';
import * as fs from 'fs-extra';
import * as path from 'path';

import {AAA_MSG, BBB_MSG, CCC_MSG_2, BBB_STATUS} from './MESSAGES';
import {RedisUrlCache} from 'redis-url-cache';
import Instance = RedisUrlCache.Instance;
import CacheEngineCB = RedisUrlCache.CacheEngineCB;
import CacheCB = RedisUrlCache.CacheCB;
import {IServerConfig, IServerRenderRule} from "./interfaces";
import CacheRules = RedisUrlCache.CacheRules;
import CallBackBooleanParam = RedisUrlCache.CallBackBooleanParam;
import CallBackStringParam = RedisUrlCache.CallBackStringParam;
const debug = require('debug')('ngServer-BBB');

export default class BBB {

    private io;

    private renderRules: IServerRenderRule;
    private cacheRules: CacheRules;
    private serverConfig: IServerConfig;

    constructor(configDir: string) {

        if (!fs.existsSync(configDir)) {
            throw `The config dir doesn't exists ${configDir}`;
        }

        const serverConfigpath: string = path.join(configDir, 'serverConfig.js');
        this.serverConfig = require(`${serverConfigpath}`);

        const renderRulesPath: string = path.join(configDir, 'serverRenderRules.js');
        this.renderRules = require(`${renderRulesPath}`);

        const cacheRulesPath: string = path.join(configDir, 'serverCacheRules.js');
        this.cacheRules = require(`${cacheRulesPath}`);

        BBB_url.loadCacheEngine(this.serverConfig.domain, 'SERVER', this.serverConfig.redisConfig, (err) => {
            if(err) {
                //todo log the error
                throw err;
            }

            this.io = io.listen(this.serverConfig.socketServers.bbb.port);

            this.io.on('connection', (socket) => {
                debug('new connection: ' + socket.id);

                socket.on(AAA_MSG.CHECK_URL, url => {
                    debug('AAA_MSG.CHECK_URL', url);

                    if(!this.shouldRender(url)) {
                        socket.emit(BBB_MSG.ANSWER, { status: BBB_STATUS.NO_RENDER});
                    } else {
                        const bbb_url = new BBB_url(url);
                        if(bbb_url.shouldCache()) {
                            debug('Should cache');
                            bbb_url.has( (err, isCached) => {
                                if(err) {
                                    //todo log the error
                                    return socket.emit(BBB_MSG.ANSWER, {status: BBB_STATUS.ERROR, err: err});
                                }
                                if(!isCached) {
                                    debug('is not cached');
                                    socket.emit(BBB_MSG.ANSWER, {status: BBB_STATUS.RENDER_CACHE});
                                } else {
                                    debug('is cached');
                                    bbb_url.get( (err, html) => {
                                        if(err) {
                                            //todo log the error
                                            return socket.emit(BBB_MSG.ANSWER, {status: BBB_STATUS.ERROR, err: err});
                                        }
                                        socket.emit(BBB_MSG.ANSWER, {status: BBB_STATUS.HTML, html: html});
                                    });
                                }
                            });
                        } else {
                            debug('should not cache');
                            socket.emit(BBB_MSG.ANSWER, {status: BBB_STATUS.RENDER_NO_CACHE});
                        }
                    }
                });

                socket.on(CCC_MSG_2.CACHE_IT, (url, html) => {
                    const newUrl = new BBB_url(url);
                    newUrl.set(url, html);
                });


                socket.on('disconnect', () => {
                    debug('BBB disconnected ', socket.id);
                });
            });
        })
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

class BBB_url {

    private URL: CacheCB;

    static cacheEngine: CacheEngineCB;

    constructor(private url: string) {
        this.URL = BBB_url.cacheEngine.url(url);
    }

    static loadCacheEngine(defaultDomain: string, instanceName: string, redisConfig, cb: Function) {
        const instance = new Instance(instanceName, redisConfig, {}, (err) => {
            if(err) return cb(err);

            BBB_url.cacheEngine = new CacheEngineCB(defaultDomain, instance);
            cb(null);
        })
    }

    shouldCache(): boolean {
        return this.URL.getCategory() === 'never' ? false : true;
    }

    has(cb: CallBackBooleanParam): void {
        this.URL.has(cb);
    }

    get(cb: CallBackStringParam): void {
        this.URL.get(cb);
    }

    set(html: string, cb:CallBackBooleanParam): void {
        this.URL.set(html, false, cb);
    }
}

