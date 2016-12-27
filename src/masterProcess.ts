import * as path from 'path';
import * as fs from 'fs-extra';
import * as async from  'async';
import * as yaml from 'js-yaml';
import {IServerConfig} from './interfaces';
import {CacheCreator, CacheEngineCB, Instance, CacheRules} from 'redis-url-cache';
import Spawner from './spawner';
import ServerLog from './serverLog';
import * as CacheServer from 'cdn-server';
import {ICDNConfig} from "cdn-server/index";

const debug = require('debug')('ngServer');

class MasterProcess {

    //private serverLog: ServerLog;
    private CCC_BinPath:string;
    private serverConfig:IServerConfig;
    private spawnBridge: Spawner;
    private cdnServer: CacheServer.CacheServer;

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
            Slimer_Rest: CacheEngineCB.helpers.unserializeCacheRules(yaml.load(fs.readFileSync(slimerRestCacheModulePath, 'utf8')))
        };

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
                    this.launchCDNServer( () => {
                        cb(null);
                    });

                }
            }
        );
    }


    stop(cb: Function) {
        this.spawnBridge.exit();
        this.cdnServer.stop( (err) => {
            if(err) return cb(err);
            cb();
        });
    }

    private launchCCC() {
        this.spawnBridge = new Spawner('Bridge', this.CCC_BinPath);
        this.spawnBridge.setParameters([this.configDir]);
        this.spawnBridge.launch(false, ()=>{}, ()=>{});
    }

    private launchCDNServer( cb: Function) {



        const cacheRules:CacheRules = CacheEngineCB.helpers.unserializeCacheRules(yaml.load(fs.readFileSync(path.join(this.configDir, 'slimerRestCacheRules.yml'), 'utf8')));

        const cdnConfig:ICDNConfig = {
            defaultDomain: this.serverConfig.domain,
            port: this.serverConfig.socketServers.proxy.port,
            instanceName: 'SLIMER_REST',
            redisConfig: this.serverConfig.redisConfig,
            cacheRules: cacheRules
        };

        debug('cahche Server = ');
        debug(CacheServer);

        debug('cdnConfig', cdnConfig);

        this.cdnServer = new CacheServer(cdnConfig, ServerLog.Log.child({
            script: 'CacheServer'
        }));

        this.cdnServer.start(cb)
    }
}

export = MasterProcess;