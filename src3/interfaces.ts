'use strict';

import {RedisUrlCache} from 'redis-url-cache';
import RedisStorageConfig = RedisUrlCache.RedisStorageConfig;


export interface IServerRenderRule {
    strategy:string,
    rules:RegExp[]
}

export interface IServerConfig {
    domain:string,
    timeout:number,
    logBasePath:string,
    socketServers:{
        bbb:{
            host:string,
            port:number
        },
        ccc_1: {
            host:string,
            port:number
        },
        ccc_2: {
            host:string,
            port:number
        }

    },
    redisConfig:RedisStorageConfig
}

