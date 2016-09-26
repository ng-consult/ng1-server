import {IServerConfig,} from './../interfaces';
import Helpers from './../Helpers';
import * as dbug from 'debug';
var debug = dbug('angular.js-server');

export default class ServerConfig {
    private serverConfig:IServerConfig = {
        domain: 'http://localhost',
        port: 80,
        timeout: 10000,
        debug: true,
        base: '/'
    };

    constructor() {

    }

    importConfig(config:IServerConfig) {
        this.setDomain(config.domain);
        this.setPort(config.port);
        this.setTimeout(config.timeout);
        this.setDebug(config.debug);
        this.setBase(config.base);
    }

    //Setters
    setDomain = (domain:string):void => {
        Helpers.CheckType(domain, 'string');
        this.serverConfig.domain = domain;
    };

    setPort = (port:number):void => {
        Helpers.CheckType(port, 'number');
        this.serverConfig.port = port;
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

    //getters
    getDomain = ():string => {
        return this.serverConfig.domain;
    };

    getPort = ():number => {
        return this.serverConfig.port;
    };

    getTimeout = ():number => {
        return this.serverConfig.timeout;
    };

    getDebug = ():boolean => {
        return this.serverConfig.debug;
    };

    getBase = (): string => {
        return this.serverConfig.base;
    };
}
