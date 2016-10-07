import {IServerConfig,} from './../interfaces';
import Helpers from './../Helpers';
import * as dbug from 'debug';
import {RedisStorageConfig} from 'redis-url-cache';
import * as nodeurl from 'url';
import {CacheRuleCreator} from 'redis-url-cache';

var debug = dbug('angular.js-server');

export default class ServerConfig {
    private serverConfig:IServerConfig;

    constructor() {
        const storageConfig: RedisStorageConfig = {
            "host": "127.0.0.1",
            "port": 6379,
            "socket_keepalive": true
        };

        this.serverConfig = {
            domain: 'http://localhost',
            timeout: 10000,
            debug: true,
            base: '/',
            jsdomConsole: 'log',
            storageConfig: storageConfig
        };
    }

    importConfig(config:IServerConfig) {
        this.setDomain(config.domain);
        this.setTimeout(config.timeout);
        this.setDebug(config.debug);
        this.setBase(config.base);
        this.setJSDomCOnsole(config.jsdomConsole);
        this.setStorageConfig(config.storageConfig);
    }

    //Setters
    /**
     *
     * @param domain This is a valid domain string including protocol, and port definition (if needed)
     */
    setDomain = (domain:string):void => {
        let parsedUrl = nodeurl.parse(domain);
        const url = Helpers.CheckHostname(domain);
        url.pathname = null;
        url.hash = null;
        url.search = null;
        url.query = null;
        url.path = null;
        this.serverConfig.domain = nodeurl.format(url);
    };

    setTimeout = (timeout:number):void => {
        Helpers.CheckType(timeout, 'number');
        this.serverConfig.timeout = timeout;
    };

    setDebug = (debug:boolean):void => {
        Helpers.CheckType(debug, 'boolean');
        this.serverConfig.debug = debug;
    };

    setBase = (base: string): void => {
        Helpers.CheckType(base, 'string');
        this.serverConfig.base = base;
    };

    setStorageConfig(storageConfig:RedisStorageConfig) {
        this.serverConfig.storageConfig = storageConfig;
    }

    setJSDomCOnsole(jsdomConsole) {
        this.serverConfig.jsdomConsole = jsdomConsole;
    }

    //getters
    getDomain = ():string => {
        return this.serverConfig.domain;
    };

    getStorageConfig(): RedisStorageConfig {
        return this.serverConfig.storageConfig;
    }

    getTimeout = ():number => {
        return this.serverConfig.timeout*1000;
    };

    getDebug = ():boolean => {
        return this.serverConfig.debug;
    };

    getBase = (): string => {
        return this.serverConfig.base;
    };

    getJSDomConsole(): string {
        return this.serverConfig.jsdomConsole;
    }
}
