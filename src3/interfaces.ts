'use strict';
import {ENUM_RENDER_STATUS, ENUM_CACHE_STATUS,PARAM_CLIENT_REQUEST} from './MESSAGES';
import SlimerProcess from './slimerProcess';
import {RedisUrlCache} from 'redis-url-cache';
import RedisStorageConfig = RedisUrlCache.RedisStorageConfig;


export interface IServerRenderRule {
    strategy:string,
    rules:RegExp[]
}
export interface IDomainInfo {
    protocol: string,
    host: string,
    port:number
}

export interface IServerConfig {
    domain:string,
    timeout:number,
    logBasePath:string,
    gelf: {
        enabled: boolean,
        host?: string,
        port?: number
    },
    socketServers:{
        ccc_1: IDomainInfo,
        ccc_2: IDomainInfo,
        fff: IDomainInfo, //slimer & rest
    },
    redisConfig:RedisStorageConfig
}

export interface IHeaders {
    [name: string]: string
}

//INternal
export interface IRequestResult {
    content: string,
    status: number,
    headers: IHeaders
}

export interface UrlPoolElement {
    socketId: string,
    query: PARAM_CLIENT_REQUEST,
    status: ENUM_RENDER_STATUS,
    html?: string,
    pid?: number,
    exit: boolean,
    benchmark: {
        queued: number,
        started: number,
        closed: number
    },
    spawner?: SlimerProcess
}

export interface UrlPool {
    [uid: string]: UrlPoolElement
}