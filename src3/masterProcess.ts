import * as path from 'path';
import * as fs from 'fs-extra';
import * as async from  'async';
import * as yaml from 'js-yaml';

import {IServerConfig} from './interfaces';
import {RedisUrlCache} from 'redis-url-cache';
import CacheCreator = RedisUrlCache.CacheCreator;
import CacheEngineCB = RedisUrlCache.CacheEngineCB; //for testing only
import Instance = RedisUrlCache.Instance; //for testing only
import Spawner from './spawner';
import ServerLog from './serverLog';
import Validators from "./validators";

const debug = require('debug')('ngServer');

class MasterProcess {

    //private serverLog: ServerLog;
    private CCC_BinPath:string;
    private SLIMER_REST_SERVER_BinPath:string = path.resolve(__dirname + './../bin/fff.js');
    private serverConfig:IServerConfig;
    private spawnBridge: Spawner;
    private spawnFFF: Spawner;

    constructor(private configDir:string) {
        debug('DIRNAME = ', __dirname);

        this.CCC_BinPath =  path.resolve( __dirname + './../bin/ccc.js');
        debug('BIN PATH = ', this.CCC_BinPath);


        if (!fs.existsSync(configDir)) {
            throw `The config dir doesn't exists ${configDir}`;
        }
        let configPath:string;
        ['serverConfig.yml', 'serverRenderRules.yml', 'serverCacheRules.yml', 'slimerRestCacheRules.yml'].forEach((item) => {
            configPath = path.join(configDir, item);
            if (!fs.existsSync(configPath)) {
                throw new Error('The config file ' + configPath + ' doesnt exists');
            }
            //check file validity
            yaml.load(fs.readFileSync(configPath, 'utf8'));
        });

        //todo check every config file syntax

        this.serverConfig = yaml.load(fs.readFileSync( path.join(this.configDir, 'serverConfig.yml') , 'utf8'));

        debug('serverConfig  ', this.serverConfig);

        ServerLog.initLogs(this.serverConfig.logBasePath, this.serverConfig.gelf);

        ServerLog.Log.info('Master starting');
    }

    start(cb: Function) {

        const slimerRestCacheModulePath = path.join(this.configDir, 'slimerRestCacheRules.yml');

        const cacheRules = {
            Slimer_Rest: Validators.unserializeCacheRules(yaml.load(fs.readFileSync(slimerRestCacheModulePath, 'utf8')))
        };

        console.log('YO', cacheRules.Slimer_Rest.maxAge);

        let parrallelFns = {};
        for(var key in cacheRules) {
            parrallelFns[key] = (cb) => {
                CacheCreator.createCache(key.toUpperCase(), true, this.serverConfig.redisConfig, cacheRules[key], (err) => {
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


    stop(cb: Function) {
        this.spawnBridge.exit();
        this.spawnFFF.exit();
    }

    public addTestURL(cb: Function) {
        const instance = new Instance('SERVER', this.serverConfig.redisConfig, {}, (err) => {
            const cacheEngine = new CacheEngineCB('http://localhost:3000',instance);
            var url = cacheEngine.url('/home');
            return url.set('<b>CachedContent</b>', {}, false, cb);
        });
    }

    private launchCCC() {
        this.spawnBridge = new Spawner('Bridge', this.CCC_BinPath);
        this.spawnBridge.setParameters([this.configDir]);
        this.spawnBridge.launch(false, ()=>{}, ()=>{});
    }

    private launchFFF() {
        this.spawnFFF = new Spawner('FFF', this.SLIMER_REST_SERVER_BinPath);
        this.spawnFFF.setParameters([this.configDir]);
        this.spawnFFF.launch(false, ()=>{}, ()=>{});
    }
}

export = MasterProcess;