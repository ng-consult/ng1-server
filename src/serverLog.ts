import * as bunyan from 'bunyan';
import * as path from 'path';
import * as fs from 'fs-extra';
import {UrlPoolElement} from './interfaces';
const gelfStream = require('gelf-stream');
const debug = require('debug')('ngServer-serverLog');

export default class ServerLog {

    static Log:bunyan.Logger;
    static WebAppLog:bunyan.Logger;

    /*
     query: query,
     socketId: socketId,
     status: ENUM_RENDER_STATUS.QUEUED,
     exit: false,
     benchmark: {
     queued: Date.now(),
     started: 0,
     closed: 0
     }
     */
    static poolSerializer(elem: UrlPoolElement) {
        return {
            query: elem.query,
            status: elem.status,
            benchmark: elem.benchmark,
            spawner: typeof elem.spawner !== 'undefined' ? elem.spawner.getSpawner(): null
        };
    }

    static initLogs(basePath: string, gelf) {


        let logPath: string;

        try{
            logPath = basePath;
            fs.ensureDirSync(logPath);
            fs.chmodSync(logPath, '777');
        } catch(e) {
            logPath = path.join(__dirname, basePath);
            fs.ensureDirSync(logPath);
            fs.chmodSync(logPath, '777');
        }


        const appStreams: bunyan.Stream[] = [
            {
                level: 'trace',
                path: path.join(logPath, 'trace.log')
            },
            {
                level: 'info',
                path: path.join(logPath, 'info.log')
            },
            {
                level: 'error',
                path: path.join(logPath, 'error.log')
            }
        ];

        const webAppStreams: bunyan.Stream[] = [
            {
                level: 'trace',
                path: path.join(logPath, 'web-app.log')
            },
            {
                level: 'error',
                path: path.join(logPath, 'web-app-error.log')
            }
        ];

        if(gelf.enabled) {
            const stream = gelfStream.forBunyan(gelf.host, gelf.port);

            appStreams.push({
                stream: stream,
                type: 'raw',
                level: 'trace'
            });

            webAppStreams.push({
                stream: stream,
                type: 'raw',
                level: 'trace'
            });
        }


        ServerLog.Log = bunyan.createLogger(
            {
                name: 'ServerLog',
                streams: appStreams,
                serializers: bunyan.stdSerializers
            }
        );
        ServerLog.Log.addSerializers({
            pool: ServerLog.poolSerializer
        });

        ServerLog.WebAppLog = bunyan.createLogger({
            name: "WebApp",
            streams: webAppStreams,
            serializers: bunyan.stdSerializers
        });
        ServerLog.WebAppLog.addSerializers({
            pool: ServerLog.poolSerializer
        });
    }
}