import {IGeneralConfig} from './interfaces';
import * as dbug from 'debug';
var debug = dbug('angular.js-server');
import CacheConfig from './config/cache';
import LogConfig from './config/log';
import RenderConfig from './config/render';
import ServerConfig from './config/server';

export default class EngineConfig {
    
    public cache: CacheConfig;
    public restCache: CacheConfig;
    public server: ServerConfig;
    public log: LogConfig;
    public render: RenderConfig;

    constructor(config?: IGeneralConfig) {
        this.cache = new CacheConfig();
        this.restCache = new CacheConfig();
        this.server = new ServerConfig();
        this.log = new LogConfig();
        this.render = new RenderConfig();

        if(config) {
            this.server.importConfig(config.server);
            this.render.importConfig(config.render);
            this.cache.importConfig(config.cache);
            this.restCache.importConfig(config.restCache);
            this.log.importConfig(config.log);
        }

        this.setConfigInstanciated();
        this.cache.initialize();
        this.restCache.initialize();
        this.log.initialize();
    }
    
    private setConfigInstanciated():void{
        this.cache.setConfigInstanciated(true);
        this.log.setConfigInstanciated(true);
    }
}
