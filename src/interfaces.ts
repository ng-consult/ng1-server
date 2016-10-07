import {RedisStorageConfig, CacheRules} from 'redis-url-cache';


type JsDomConsoleConfig =  'none' | 'log' | 'all';

export interface IServerConfig {
    domain: string,
    timeout: number,
    debug: boolean,
    jsdomConsole: JsDomConsoleConfig,
    base: string,
    storageConfig: RedisStorageConfig
}

export interface IRenderConfig {
    strategy: string,
    rules : RegExp[]
}

export interface ILogConfigData {
    enabled: boolean,
    stack: boolean
}

export interface ILogConfig {
    dir: string,
    log: ILogConfigData,
    warn: ILogConfigData,
    error: ILogConfigData,
    info: ILogConfigData,
    debug: ILogConfigData,
    serverLogFile: string
}

export interface IGeneralConfig {
    name: string,
    server: IServerConfig,
    render: IRenderConfig,
    serverCache: CacheRules,
    restCache: CacheRules,
    jsdomCache: CacheRules,
    log: ILogConfig
}

export interface INGResponse {
    html: string,
    status: string,
    code: number,
    errorMsg: string,
    stacktrace: any
}

export enum NGResponseCodes  {
    RENDERED = 0,
    RENDER_EXCLUDED = 1,
    ALREADY_CACHED = 2,
    SERVER_TIMEOUT = 3,
    ERROR_HANDLER = 4,
    SERVER_ERROR = 5,
    JSDOM_ERROR = 6,
    JSDOM_URL_ERROR = 7,
    CACHE_ENGINE_ERROR = 8
}


export enum JSDOM_EVENTS  {
    JSDOM_ERROR= 0,
    JSDOM_URL_ERROR = 1,
    JSDOM_CREATED_ERROR = 2,
    JSDOM_DONE_ERROR = 3
};




