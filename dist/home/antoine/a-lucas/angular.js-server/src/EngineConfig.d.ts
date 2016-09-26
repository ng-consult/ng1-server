import { IGeneralConfig } from './interfaces';
import CacheConfig from './config/cache';
import LogConfig from './config/log';
import RenderConfig from './config/render';
import ServerConfig from './config/server';
export default class EngineConfig {
    cache: CacheConfig;
    restCache: CacheConfig;
    server: ServerConfig;
    log: LogConfig;
    render: RenderConfig;
    constructor(config?: IGeneralConfig);
    private setConfigInstanciated();
}
