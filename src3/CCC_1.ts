'use strict';

import * as io from 'socket.io';
import DDD from './DDD';
import * as fs from 'fs-extra';
import * as path from 'path';
import {IServerConfig} from "./interfaces";
import {AAA_MSG, CCC_MSG_1} from './MESSAGES';
const debug = require('debug')('ngServer-CCC_1');


interface socketCollection {
    [id: string]: SocketIO.Socket
}

export default class CCC_1 {

    static sockets: socketCollection = {};

    private serverConfig: IServerConfig;

    constructor(configDir: string) {

        if (!fs.existsSync(configDir)) {
            throw `The config dir doesn't exists ${configDir}`;
        }

        const serverConfigpath: string = path.join(configDir, 'serverConfig.js');
        this.serverConfig = require(`${serverConfigpath}`);

        const server = io.listen(this.serverConfig.socketServers.ccc_1.port);
        
        server.on('connection', socket => {

            debug('CCC_1 new connection ', socket.id)
            CCC_1.sockets[socket.id] = socket;

            socket.on(AAA_MSG.GET_URL, (query) => {
                debug('CCC_1 on.AAA_MSG.GET_URL', query)
                DDD.addRender(socket.id, query);
            });

            socket.on('disconnect', () => {
                debug('CCC_1 disconnected ', socket.id);
                delete CCC_1.sockets[socket.id];
                DDD.CCC_1_socketDisconnected(socket.id);
            });
        });
        
    }

    //called from DDD
    static notifyAAA(socketID, status) {
        debug('CCC_1 emit.CCC_MSG_1.RENDER_STATUS ');
        CCC_1.sockets[socketID].emit(CCC_MSG_1.RENDER_STATUS, status);
    }

}
