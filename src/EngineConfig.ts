import {FileStorageConfig, RedisStorageConfig, CacheRules} from 'simple-url-cache';

interface ServerConfig {
    domain: string,
    port: number,
    timeout: number
}

interface RenderConfig {
    strategy: string,
    rules : RegExp[]
}

export interface LogConfigData {
    enabled: boolean,
    stack: boolean
}

export interface LogConfig {
    dir: string,
    log: LogConfigData,
    warn: LogConfigData,
    error: LogConfigData,
    info: LogConfigData,
    debug: LogConfigData
}

export interface CacheConfig{
    storageConfig: FileStorageConfig,
    cacheRules: CacheRules
}

export interface Config {
    name: string,
    server: ServerConfig,
    render: RenderConfig,
    cache: CacheConfig,
    log: LogConfig
}