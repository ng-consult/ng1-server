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

        fs.ensureDirSync(basePath);
        fs.chmodSync(basePath, '777');

        const appStreams: bunyan.Stream[] = [
            {
                level: 'trace',
                path: path.join(basePath, 'trace.log')
            },
            {
                level: 'info',
                path: path.join(basePath, 'info.log')
            },
            {
                level: 'error',
                path: path.join(basePath, 'error.log')
            }
        ];

        const webAppStreams: bunyan.Stream[] = [
            {
                level: 'trace',
                path: path.join(basePath, 'web-app.log')
            },
            {
                level: 'error',
                path: path.join(basePath, 'web-app-error.log')
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


