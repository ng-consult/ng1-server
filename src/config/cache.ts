import {ICacheConfig} from './../interfaces';
import {CacheEngine, FileStorageConfig, RedisStorageConfig, MaxAgeRegexRule, StorageConfig, RegexRule} from 'simple-url-cache';
import Helpers from './../Helpers';
import * as path from 'path';
import * as dbug from 'debug';
var debug = dbug('angular.js-server');


export default class CacheConfig{

    private cacheConfig:ICacheConfig = {
        storageConfig: {
            type: 'file',
            dir: path.resolve( process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']  + '/cache/angular.js-server')
        },
        cacheRules: {
            default: 'never',
            cacheMaxAge: [],
            cacheNever: [],
            cacheAlways: []
        }
    };

    private configInstanciated: boolean = false;

    private cache: CacheEngine;

    constructor() {}

    importConfig(config:ICacheConfig) {
        this.setStorageConfig(config.storageConfig);
        this.setDefault(config.cacheRules.default);
        config.cacheRules.cacheMaxAge.forEach(item => {
            this.addMaxAgeRule(item.regex, item.maxAge);
        });
        config.cacheRules.cacheAlways.forEach(item => {
            this.addAlwaysRule(item.regex);
        });
        config.cacheRules.cacheNever.forEach(item => {
            this.addNeverRule(item.regex);
        });
    }

    getCacheEngine(): CacheEngine {
        return this.cache;
    }

    setConfigInstanciated(bool: boolean):void {
        this.configInstanciated = bool;
    }

    initialize():void {
        if(!this.configInstanciated) {return}
        this.cache = new CacheEngine(this.cacheConfig.storageConfig, this.cacheConfig.cacheRules);
    }

    //helpers

    clearCachedUrl(url:string):Promise<boolean> {
        Helpers.CheckType(url, 'string');
        return this.cache.url(url).removeUrl();
    };

    clearAllCachedUrl():Promise<boolean> {
        return this.cache.clearAllCache();
    };

    //setters

    setStorageConfig(config:FileStorageConfig | RedisStorageConfig):void {
        this.cacheConfig.storageConfig = config;
        this.initialize();
    };

    setDefault(def:string):void {
        Helpers.StringIn(def, ['always', 'never']);
        this.cacheConfig.cacheRules.default = def;
        this.initialize();
    };

    addMaxAgeRule(rule:RegExp, maxAge:number):void {
        this.checkExists(rule);
        this.cacheConfig.cacheRules.cacheMaxAge.push({regex: rule, maxAge: maxAge});
        this.initialize();
    };

    addAlwaysRule(rule:RegExp):void {
        this.checkExists(rule);
        this.cacheConfig.cacheRules.cacheAlways.push({regex: rule});
        this.initialize();
    };

    addNeverRule(rule:RegExp):void {
        this.checkExists(rule);
        this.cacheConfig.cacheRules.cacheNever.push({regex: rule});
        this.initialize();
    };

    removeMaxAgeRule(rule:RegExp):void {
        Helpers.CheckType(rule, RegExp);
        let index = null;
        for (let i in this.cacheConfig.cacheRules.cacheMaxAge) {
            if (Helpers.SameRegex(this.cacheConfig.cacheRules.cacheMaxAge[i].regex, rule)) {
                index = i;
            }
        }
        if (index !== null) {
            this.cacheConfig.cacheRules.cacheMaxAge.splice(index, 1);
            this.initialize();
        }
    };

    removeAlwaysRule(rule:RegExp):void {
        Helpers.CheckType(rule, RegExp);
        let index = null;
        for (let i in this.cacheConfig.cacheRules.cacheAlways) {
            if (Helpers.SameRegex(this.cacheConfig.cacheRules.cacheAlways[i].regex, rule)) {
                index = i;
            }
        }
        if (index !== null) {
            this.cacheConfig.cacheRules.cacheAlways.splice(index, 1);
            this.initialize();
        }
    };

    removeNeverRule(rule:RegExp):void {
        Helpers.CheckType(rule, RegExp);
        let index = null;
        for (let i in this.cacheConfig.cacheRules.cacheNever) {
            if (Helpers.SameRegex(this.cacheConfig.cacheRules.cacheNever[i].regex, rule)) {
                index = i;
            }
        }
        if (index !== null) {
            this.cacheConfig.cacheRules.cacheNever.splice(index, 1);
            this.initialize();
        }
    };

    removeAllMaxAgeRules():void {
        this.cacheConfig.cacheRules.cacheMaxAge = [];
    };

    removeAllAlwaysRules():void {
        this.cacheConfig.cacheRules.cacheAlways = [];
    };

    removeAllNeverRules():void {
        this.cacheConfig.cacheRules.cacheNever = [];
    };

    removeAllRules():void {
        this.removeAllAlwaysRules();
        this.removeAllMaxAgeRules();
        this.removeAllNeverRules();
    };

    //getters

    getDefault():string {
        return this.cacheConfig.cacheRules.default;
    };

    getMaxAgeRules():MaxAgeRegexRule[] {
        return this.cacheConfig.cacheRules.cacheMaxAge;
    };

    getAlwaysRules():RegexRule[] {
        return this.cacheConfig.cacheRules.cacheAlways;
    };

    getNeverRules():RegexRule[] {
        return this.cacheConfig.cacheRules.cacheNever;
    };


    private checkExists(rule: RegExp): void {
        Helpers.RegexNotIn(rule, this.getRegexes(this.cacheConfig.cacheRules.cacheMaxAge));
        Helpers.RegexNotIn(rule, this.getRegexes(this.cacheConfig.cacheRules.cacheNever));
        Helpers.RegexNotIn(rule, this.getRegexes(this.cacheConfig.cacheRules.cacheAlways));
    }

    private getRegexes( collection: RegexRule[] | MaxAgeRegexRule[] ): RegExp[] {
        let reg = [];
        for(let i in collection) {
            reg.push(collection[i].regex);
        }
        return reg;
    }
}
