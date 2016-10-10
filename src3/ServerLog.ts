import {LoggerInstance, } from "winston";
import * as util from 'util';
import * as winston from 'winston';
import * as fs from 'fs-extra';
import * as path from 'path';
import {LogCallback} from "winston";

const debug = require('debug')('ngServer');


type color = 'green' | 'yellow' | 'red';

interface ILogLevels {
    [type: string] : {
        color: color,
        priority: number
    }
};

interface IServerLoggers {
    [name: string]: ServerLogger;
}

export class ServerLogger{

    constructor(private logger: LoggerInstance){}

    public log(type: string, msg: string | Array<string|Object>, meta?: any, cb?: LogCallback):void {
        let formattedMsg: string;
        if(msg instanceof Array) {
            formattedMsg = this.format(msg);
        } else {
            console.log('msg is not an array: ', msg);
            formattedMsg = msg;
        }

        const params: Array<any> = [formattedMsg];
        if(meta) params.push(meta);
        if(cb) params.push(cb);

        this.logger[type].apply(this.logger, params);
    }

    private format(v: Array<string|Object>): string{
        // convert arguments object to real array
        var args = Array.prototype.slice.call(v);
        for(var k in args){
            if (typeof args[k] === "object"){
                // args[k] = JSON.stringify(args[k]);
                args[k] = util.inspect(args[k], false, null, true);
            }
        }
        var str = args.join(" ");
        return str;
    }
}

export class ServerLoggers {

    static loggers: IServerLoggers = {};

    private logger: LoggerInstance;

    static init(name: string, basePath: string, levels: ILogLevels): void {
        fs.ensureDirSync(path.join(basePath, name));

        const Wtransports: winston.TransportInstance[] = [];

        let Wlevels = {};
        let Wcolors = {};

        for(var key in levels) {
            Wlevels[key] = levels[key].priority;
            Wcolors[key] = levels[key].color;
            Wtransports.push(new (winston.transports.File)({
                name: key,
                filename: path.join(basePath, name, key + '.log'),
                level: key
            }));
        }

        ServerLoggers.loggers[name] = new ServerLogger(new (winston.Logger)({
            levels: Wlevels,
            colors: Wcolors,
            transports: Wtransports
        }));
    }

    static getLogger(name): ServerLogger {
        return ServerLoggers.loggers[name];
    }

}
