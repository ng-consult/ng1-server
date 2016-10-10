import * as path from 'path';
import * as fs from 'fs-extra';
import * as child_process from 'child_process';
import {ServerLoggers} from './ServerLog';
import {IServerConfig} from './interfaces';
import {RedisUrlCache} from 'redis-url-cache';
import CacheRulesCreator = RedisUrlCache.CacheRulesCreator;
import * as async from  'async';
import Spawner from './Spawner';

const debug = require('debug')('ngServer');

export default class MasterProcess {

    //private serverLog: ServerLog;
    private BBBBinPath:string = path.resolve(__dirname + './../bin/bbb.js');
    private CCC_1BinPath:string = path.resolve(__dirname + './../bin/ccc_1.js');

    private serverConfig:IServerConfig;

    constructor(private configDir:string) {
        if (!fs.existsSync(configDir)) {
            throw `The config dir doesn't exists ${configDir}`;
        }
        let configPath:string;
        ['serverConfig.js', 'serverRenderRules.js', 'serverCacheRules.js', 'restCacheRules.js', 'slimerCacheRules.js'].forEach((item) => {
            configPath = path.join(configDir, item);
            if (!fs.existsSync(configPath)) {
                throw new Error('The config file ' + configPath + ' doesnt exists');
            }
        });
        
        const configpath:string = path.join(this.configDir, 'serverConfig.js');

        this.serverConfig = require(`${configpath}`);

        ServerLoggers.init('master', this.serverConfig.logBasePath, {
            'redis-error': {
                color: 'red',
                priority: 1
            },
            'child_process': {
                color: 'red',
                priority: 2
            }
        });

        ServerLoggers.init('bbb', this.serverConfig.logBasePath, {
            'socket-aaa': {
                color: 'green',
                priority: 1
            },
            'redis-error': {
                color: 'red',
                priority: 3
            }
        });

        ServerLoggers.init('ccc_1', this.serverConfig.logBasePath, {
            'socket-aaa': {
                color: 'green',
                priority: 1
            }
        });

        ServerLoggers.init('ccc_2', this.serverConfig.logBasePath, {
            'socket-ccc_1': {
                color: 'green',
                priority: 1
            }
        });

        ServerLoggers.init('ddd', this.serverConfig.logBasePath, {
            'info': {
                color: 'green',
                priority: 1
            },
            'closing': {
                color: 'yellow',
                priority: 2
            },
            'error': {
                color: 'red',
                priority: 3
            }
        });

        ServerLoggers.init('eee', this.serverConfig.logBasePath, {
            'dev': {
                color: 'green',
                priority: 0
            },
            'log': {
                color: 'green',
                priority: 0
            },
            'info': {
                color: 'green',
                priority: 1
            },
            'debug': {
                color: 'yellow',
                priority: 2
            },
            'warning': {
                color: 'yellow',
                priority: 3
            },
            'error': {
                color: 'red',
                priority: 4
            }
        });

        //TODO validate config files
    }

    start() {

        const serverCacheModulePath = path.join(this.configDir, 'serverCacheRules.js');
        const restCacheModulePath = path.join(this.configDir, 'restCacheRules.js');
        const slimerCacheModulePath = path.join(this.configDir, 'slimerCacheRules.js');

        const cacheRules = {
            server: require(`${serverCacheModulePath}`),
            rest: require(`${restCacheModulePath}`),
            slimer: require(`${slimerCacheModulePath}`)
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
                    //this.serverLog.log('server', ["Error creating cache for", cacheData.t], {rules: cacheData.r, err: err, instance: cacheData.t});
                } else {
                    this.launchBBB();
                    this.launchCCC();
                }
            }
        );
    }

    private launchCCC() {
        const spawn = new Spawner('CCC_1', this.CCC_1BinPath, null);
        spawn.setParameters([this.configDir]);
        spawn.launch(false, ()=>{}, ()=>{});
    }

    private launchBBB() {
        const spawn = new Spawner('BBB', this.BBBBinPath, null);
        spawn.setParameters([this.configDir]);
        spawn.launch(false, ()=>{}, ()=>{});
    }

}