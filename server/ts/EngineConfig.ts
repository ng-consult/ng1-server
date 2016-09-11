/**
 * Created by antoine on 07/07/16.
 */

interface ServerConfig {
    domain: string,
    port: number,
    timeout: number
}

interface RenderConfig {
    strategy: string,
    rules : RegExp[]
}

export interface RegexRule {
    regex: RegExp
}

export interface MaxAgeRegexRule extends RegexRule{
    maxAge: number
}

export interface CacheConfig{
    type: string,
    fileDir: string,
    cacheMaxAge: MaxAgeRegexRule[],
    cacheAlways: RegexRule[],
    cacheNever: RegexRule[],
    cacheTimestamp: RegexRule[]
}

export interface Config {
    name: string,
    server: ServerConfig,
    render: RenderConfig,
    cache: CacheConfig
}