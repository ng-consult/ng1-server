import * as path from 'path';
import * as fs from 'fs-extra';
import * as async from  'async';
import {IServerConfig} from './interfaces';
import {RedisUrlCache} from 'redis-url-cache';
import CacheRulesCreator = RedisUrlCache.CacheRulesCreator;
import CacheEngineCB = RedisUrlCache.CacheEngineCB; //for testing only
import Instance = RedisUrlCache.Instance; //for testing only
import Spawner from './spawner';
import ServerLog from './serverLog';

const debug = require('debug')('ngServer');

export default class MasterProcess {

    //private serverLog: ServerLog;
    private CCC_BinPath:string = path.resolve(__dirname + './../bin/ccc.js');
    private SLIMER_REST_SERVER_BinPath:string = path.resolve(__dirname + './../bin/fff.js');
    private serverConfig:IServerConfig;

    constructor(private configDir:string) {
        if (!fs.existsSync(configDir)) {
            throw `The config dir doesn't exists ${configDir}`;
        }
        let configPath:string;
        ['serverConfig.js', 'serverRenderRules.js', 'serverCacheRules.js', 'slimerRestCacheRules.js'].forEach((item) => {
            configPath = path.join(configDir, item);
            if (!fs.existsSync(configPath)) {
                throw new Error('The config file ' + configPath + ' doesnt exists');
            }
        });

        const configpath:string = path.join(this.configDir, 'serverConfig.js');

        this.serverConfig = require(`${configpath}`);
        
        ServerLog.initLogs(this.serverConfig.logBasePath, this.serverConfig.gelf);

        ServerLog.Log.info('MAster started');
        //TODO validate config files
    }

    start(cb: Function) {

        const slimerRestCacheModulePath = path.join(this.configDir, 'slimerRestCacheRules.js');

        const cacheRules = {
            Slimer_Rest: require(`${slimerRestCacheModulePath}`)
        };

        let parrallelFns = {};
        for(var key in cacheRules) {
            parrallelFns[key] = (cb) => {
                CacheRulesCreator.createCache(key.toUpperCase(), true, this.serverConfig.redisConfig, cacheRules[key], (err) => {
                    if (err) return cb(err);
                    cb(null);
                });
            };
        }

        debug('Starting');

        async.parallel(parrallelFns, (err, results) => {
                if( err) {
                    return cb(err);
                    //this.serverLog.log('server', ["Error creating cache for", cacheData.t], {rules: cacheData.r, err: err, instance: cacheData.t});
                } else {
                    this.launchCCC();
                    this.launchFFF();
                    cb(null);
                }
            }
        );
    }

    public addTestURL(cb: Function) {
        const instance = new Instance('SERVER', this.serverConfig.redisConfig, {}, (err) => {
            const cacheEngine = new CacheEngineCB('http://localhost:3000',instance);
            var url = cacheEngine.url('/home');
            return url.set('<b>CachedContent</b>', {}, false, cb);
        });
    }

    private launchCCC() {
        const spawn = new Spawner('Bridge', this.CCC_BinPath);
        spawn.setParameters([this.configDir]);
        spawn.launch(false, ()=>{}, ()=>{});
    }

    private launchFFF() {
        const spawn = new Spawner('FFF', this.SLIMER_REST_SERVER_BinPath);
        spawn.setParameters([this.configDir]);
        spawn.launch(false, ()=>{}, ()=>{});
    }
}