'use strict';

import * as io from 'socket.io';
import Bridge_Pool from './bridge_Pool';
import {
    MSG, PARAM_RENDER_STATUS, PARAM_CLIENT_REQUEST, ENUM_CACHE_STATUS, ENUM_RENDER_STATUS,
    PARAM_CLIENT_ANSWER
} from './MESSAGES';
import * as  fs from 'fs';
import * as tmp from 'tmp';
import {Cache} from './cache';
import ServerLog from './serverLog';

const debug = require('debug')('ngServer-Bridge_external');

interface socketCollection {
    [id: string]: SocketIO.Socket
}

export default class Bridge_S1 {

    static sockets: socketCollection = {};

    constructor(port: number, private cache: Cache) {

        debug('going to listen to port', port);
        const server = io.listen(port, {
            allowRequest: function(handshake, cb){
                //todo Make sure only Client can connect
                cb(null, true);
            }
        });

        server.on('connection', socket => {

            debug('Bridge_S1 new connection ', socket.id)
            Bridge_S1.sockets[socket.id] = socket;

            const logger = ServerLog.Log.child({
                script: 'Bridge_S1'
            });

            socket.on(MSG.GET_URL, (query: PARAM_CLIENT_REQUEST) => {
                if(query.html && query.html.length > 0 ) {
                    query.tmp = this.createTmpFile(query.html);
                    delete query.html;
                }
                debug('Bridge_S1 on.AAA_MSG.GET_URL', query);
                logger.debug({
                    query: query
                }, 'Bridge_S1 on.AAA_MSG.GET_URL');
                Bridge_Pool.addRender(socket.id, query);
            });

            socket.on('disconnect', () => {
                debug('Bridge_S1 disconnected ', socket.id);
                delete Bridge_S1.sockets[socket.id];
                Bridge_Pool.bridgeInternalSocketDisconnected(socket.id);
            });

            socket.on(MSG.CHECK_URL, url => {
                debug('AAA_MSG.CHECK_URL', url);
                const logger = ServerLog.Log.child({
                    script: 'Bridge_S1',
                    url: url
                });
                logger.debug('AAA_MSG.CHECK_URL');

                this.cache.checkURL(url, (status, data) => {
                    logger.debug({status: status, data: data}, 'AAA_MSG.CHECK_URL RESPONSE');
                    socket.emit(status, data);
                });
            });
        });
    }

    /**
     * Store the html inside a tmpfile, so we can pass it to the DDD.
     * @param html
     * @returns {string}
     */
    private createTmpFile(html): string {
        const fileObj = tmp.fileSync({ mode: 777, prefix: 'prefix-', postfix: '.html' });
        fs.writeSync(fileObj.fd, html, 0, 'utf-8');
        fs.closeSync(fileObj.fd);
        fs.chmodSync(fileObj.name, '0777');

        return fileObj.name;
    }

    //called from Bridge_Pool
    static notifyClient(socketID: string, uid: string, status: PARAM_CLIENT_ANSWER) {
        const logger = ServerLog.Log.child({
            script: 'Bridge_S1',
            uid: uid,
            status: status.status
        });
        logger.debug('Bridge_S1 emit.Bridge_MSG_1.RENDER_STATUS');
        Bridge_S1.sockets[socketID].emit(MSG.RENDER_STATUS, status);
    }

}
