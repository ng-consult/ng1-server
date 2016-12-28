'use strict';
import * as io from 'socket.io';
import * as http from 'http';

import Bridge_Pool from './bridge_Pool';
import {MSG, PARAM_WEBAPP_LOG, PARAM_SLIMER_ERROR, PARAM_IDLE, ENUM_CACHE_STATUS} from './MESSAGES';
import {RedisStorageConfig, CacheEngineCB, Instance} from 'redis-url-cache';
import {Cache, UrlCache} from "./cache";
import ServerLog from './serverLog';

const debug = require('debug')('ngServer-Bridge_S2');

export default class Bridge_S2 {

    constructor(port: number) {

        const httpServer  = http.createServer((req, res) => {
            debug('requesting ', req.url);
            res.writeHead(500, {'Content-Type': 'text/html'});
            res.end('Forbidden');
        });

        const server: SocketIO.Server = io.listen(httpServer, {
            allowRequest: function(handshake, cb){
                debug(handshake._query);

                if(typeof handshake._query.token === 'undefined') {
                    return cb(null, true);
                }
                if(typeof Bridge_Pool.pool[handshake._query.token] === 'undefined') {
                    return cb(null, true);
                }
                cb(null, true);
            }
        });

        httpServer.listen(port);

        server.on('connection', socket => {

            debug('bridge_internal new connection');

            socket.on(MSG.LOG, (data: PARAM_WEBAPP_LOG) => {
                debug('going to log type / args ', data.type, data.args);
                const logger = ServerLog.WebAppLog.child({uid: data.uid, script: 'EEE'});

                switch(data.type) {
                    case 'dev':
                        logger.trace(data.args);
                        break;
                    case 'debug':
                        logger.debug(data.args);
                        break;
                    case 'log':
                    case 'info':
                        logger.info(data.args);
                        break;
                    case 'warn':
                        logger.warn(data.args);
                        break;
                    case 'error':
                        logger.error(data.args);
                        break;
                }
            });

            socket.on(MSG.ERROR, (err: string) => {
                const errorObject: PARAM_SLIMER_ERROR = JSON.parse(err);
                debug('DDD_MSG_ERROR received', errorObject);
                ServerLog.Log.child({uid: errorObject.uid, script: 'Bridge_S2'}).error(errorObject);
                socket.emit(MSG.ERROR + errorObject.uid);
            });

            socket.on(MSG.IDLE, (response: PARAM_IDLE) => {

                debug('received IDLE from EEE', response.uid, response.url, response.html.length);

                debug('responseCache = ', response.exportedCache);

                const serialized = JSON.stringify(response.exportedCache);
                const script = `<script type="text/javascript">window.ngServerCache = ${serialized};</script></head>`;
                const superHTML: string = response.html.replace(/<\/head>/, script);

                //debug('Query strategy = ', Bridge_Pool.pool[response.uid].query);

                if( Bridge_Pool.pool[response.uid].query.strategy === ENUM_CACHE_STATUS.RENDER_CACHE) {
                    const newUrl = new UrlCache(Bridge_Pool.pool[response.uid].query.url);
                    newUrl.set(superHTML, {}, (err, status) => {
                        if(err) {
                            ServerLog.Log.child({uid: response.uid, script: 'Bridge_S2'}).error({response: response, err: err});
                            throw err;
                        }
                        debug('Cache on Bridge_MSG_2.CACHE_IT status = ', status);
                    });
                }
                Bridge_Pool.sendHTML_to_Client(response.uid, superHTML);
                socket.emit(MSG.IDLE + response.uid);
            });

            socket.on('disconnect', () => {
                // EEE disconnected
                debug('bridge_internal  deconnected');
            });
        });
    }
}
