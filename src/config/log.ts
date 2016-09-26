import {ILogConfig,IInstantConfig, ILogConfigData} from './../interfaces';
import Helpers from './../Helpers';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as dbug from 'debug';
var debug = dbug('angular.js-server');



export default class LogConfig implements IInstantConfig{
    private logConfig:ILogConfig = {
        dir: path.resolve( process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']  + '/log/angular.js-server'),
        log: {enabled: true, stack: false},
        error: {enabled: true, stack: false},
        warn: {enabled: true, stack: false},
        info: {enabled: true, stack: false},
        debug: {enabled: true, stack: false},
        serverLogFile: 'angular-server.log'
    };

    private configInstanciated: boolean = false;

    constructor() {}

    importConfig(config:ILogConfig) {
        this.setBasePath(config.dir);
        ['log', 'warn', 'error', 'info', 'debug'].forEach( log => {
            this.setDefinition(log, config[log].enabled, config[log].stack);
        });
        this.setFileServerName(config.serverLogFile);
    }

    setConfigInstanciated(bool: boolean):void {
        this.configInstanciated = bool;
    }

    setBasePath = (path:string):void  => {
        Helpers.CheckType(path, 'string');
        this.logConfig.dir = path;
        this.initialize();
    };

    setDefinition = (log:string, enabled:boolean, stack?:boolean):void  => {
        Helpers.CheckType(log, 'string');
        Helpers.CheckType(enabled, 'boolean');
        this.logConfig[log].enabled = enabled;
        this.logConfig[log].stack = stack ? true : false;
        this.initialize();
    };

    setFileServerName = (name: string): void => {
        Helpers.CheckType(name, 'string');
        this.logConfig.serverLogFile = name;
        this.initialize();
    }

    //getters

    getBasePath = ():string => {
        return this.logConfig.dir;
    };

    getDefinition = (log:string):ILogConfigData => {
        return this.logConfig[log];
    };

    getFileServerName = ():string => {
        return this.logConfig.serverLogFile;
    };

    //Helpers
    getLogPath = (log:string):string => {
        return path.join(this.logConfig.dir, log + '.log');
    };

    getLogServerPath = (): string => {
        return path.join(this.logConfig.dir, this.logConfig.serverLogFile + '.log');
    };

    getConfig = ():ILogConfig => {
        return this.logConfig;
    };

    public log = (...args) => {
        fs.appendFileSync(this.getLogServerPath(), args.join(', ')+'\n');
    };

    public initialize(): void {
        if(!this.configInstanciated) {return}
        this.logConfig.dir = path.resolve(path.normalize(this.logConfig.dir));

        try {
            fs.mkdirsSync(this.logConfig.dir);
        } catch(e) {
            Helpers.Error("can't create the log dir", this.logConfig.dir, e);
        }


        const paths = [];
        ['warn', 'log', 'debug', 'error', 'info'].forEach((item)=> {
            if( this.logConfig[item].enabled ) {
                paths.push( this.getLogPath(item));
            }
        });
        paths.push( path.resolve(path.join( this.logConfig.dir, 'dev.log' )));
        paths.push( this.getLogServerPath());

        paths.forEach((path) =>{
            try {
                fs.closeSync(fs.openSync(path, 'a'));
            } catch(e) {
                Helpers.Error(e);
            }
        });
    };
}
