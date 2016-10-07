import {IGeneralConfig} from './interfaces';
import * as dbug from 'debug';
import CacheConfig from './config/cache';
import LogConfig from './config/log';
import RenderConfig from './config/render';
import ServerConfig from './config/server';
import {CacheEngineCB} from "redis-url-cache/index";
//import {} from "redis-url-cache";
const debug = dbug('angular.js-server');

export default class EngineConfig {

    public server: ServerConfig;
    public log: LogConfig;
    public render: RenderConfig;

    public cache: CacheEngineCB;
    public restCache: CacheEngineCB;
    public jsdomCache: CacheEngineCB;


    constructor(config: IGeneralConfig, cb: Function) {
        this.server = new ServerConfig();
        this.log = new LogConfig(config.log);
        this.render = new RenderConfig();
        //cache

        this.server.importConfig(config.server);
        this.render.importConfig(config.render);


        const serverConfig = this.server.getStorageConfig();

        let nb = 0;
        new CacheConfig(this.server.getDomain(), 'SERVER', config.serverCache, serverConfig, (err, cacheEngine) => {
            if (err) throw err;
            this.cache = cacheEngine;
            if (++nb === 3) {
                cb(null);
            }
        });

        new CacheConfig(this.server.getDomain(), 'REST', config.restCache, serverConfig, (err, cacheEngine) => {
            if (err) throw err;
            this.restCache = cacheEngine;
            if (++nb === 3) {
                cb(null);
            }
        });

        new CacheConfig(this.server.getDomain(), 'JSDOM', config.jsdomCache, serverConfig, (err, cacheEngine) => {
            if (err) throw err;
            this.jsdomCache = cacheEngine;
            if (++nb === 3) {
                cb(null);
            }
        });
    }
}
