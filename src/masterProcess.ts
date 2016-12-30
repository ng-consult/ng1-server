import * as path from 'path';
import * as fs from 'fs-extra';
import * as async from  'async';
import * as yaml from 'js-yaml';
import {IServerConfig} from './interfaces';
import {CacheCreator, CacheEngineCB, CacheRules} from 'redis-url-cache';
import ServerLog from './serverLog';
import {CacheServer, ICDNConfig} from 'cdn-server';
import Bridge from './bridge';


const debug = require('debug')('ngServer');

class MasterProcess {

    //private serverLog: ServerLog;
    private serverConfig:IServerConfig;
    private cdnServer: CacheServer;
    private bridge: Bridge;

    constructor(private configDir:string) {
        debug('DIRNAME = ', __dirname);
        
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

        async.parallel(parrallelFns, (err) => {
                if( err) {
                    return cb(err);
                    //this.serverLog.log('server', ["Error creating cache for", cacheData.t], {rules: cacheData.r, err: err, instance: cacheData.t});
                } else {
                    this.bridge = new Bridge(this.configDir);
                    this.bridge.start( (err) => {
                        if(err) return cb(err);
                        this.launchCDNServer( (err) => {
                            if(err) return cb(err);
                            cb();
                        });
                    });
                }
            }
        );
    }


    stop(cb: Function) {
        this.bridge.stop( () => {
            this.cdnServer.stop( (err) => {
                if(err) return cb(err);
                cb();
            });
        });
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

        this.cdnServer = new CacheServer(cdnConfig, ServerLog.Log.child({
            script: 'CacheServer'
        }));

        this.cdnServer.start(cb)
    }
}

export = MasterProcess;