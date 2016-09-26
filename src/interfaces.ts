import {FileStorageConfig, RedisStorageConfig, CacheRules} from 'simple-url-cache';

export interface IServerConfig {
    protocol?: string,
    hostname?: string,
    domain: string,
    port: number,
    timeout: number,
    debug: boolean,
    base: string
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

export interface ICacheConfig{
    storageConfig: FileStorageConfig | RedisStorageConfig,
    cacheRules: CacheRules
}

export interface IGeneralConfig {
    name: string,
    server: IServerConfig,
    render: IRenderConfig,
    cache: ICacheConfig,
    restCache: ICacheConfig,
    log: ILogConfig
}

export interface IResponse {
    html: string,
    status: string,
    code: number,
    stacktrace: any
}


export interface IInstantConfig {
    configInstanciated: boolean;
    setConfigInstanciated(bool:boolean): void;
    initialize(): void;
}

