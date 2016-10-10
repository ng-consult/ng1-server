'use strict';

import * as ioClient from 'socket.io-client';
import * as io from 'socket.io';
import * as uuid from 'node-uuid';
import DDD from './DDD';

import {EEE_MSG, AAA_MSG, BBB_MSG, BBB_ANSWER, CCC_MSG_1, CCC_1_TO_AAA_ANSWER, DDD_CLOSE_STATUS, DDD_URL_STATUS, CCC_MSG_2, BBB_STATUS} from './MESSAGES';
const debug = require('debug')('ngServer');

export default class CCC_2 {

    constructor(private BBB_Domain: string, private CCC_1_Domain: string) {

        const server = io.listen(3002);

        server.on('connection', socket => {

            socket.on(EEE_MSG.LOG, (uid, type, message) => {
                //Todo log
                /*
                    BBB_LOG
                    CCC_1_LOG
                    CCC_2_LOG
                    DDD_LOG
                    EEE_LOG
                */
            });

            socket.on(EEE_MSG.IDLE, (uid, url, html) => {
                if( DDD.pool[uid].query.strategy === BBB_STATUS.RENDER_CACHE) {
                    this.sendCacheToBBB(DDD.pool[uid].query.url, html);
                }
                this.sendHTMLToCCC_1(uid, html);
            });

            socket.on('disconnect', () => {
                // EEE disconnected

            });
        });
    }


    private sendCacheToBBB(url: string, html: string) {
        const socket = ioClient.connect(this.BBB_Domain);

        socket.on('connect', () => {
            socket.emit(CCC_MSG_2.CACHE_IT, {url: url, html: html}, () => {
                socket.close();
            });
        });
    }
    
    private sendHTMLToCCC_1(uid: string,  html: string) {
        DDD.sendHTML_to_AAA(uid, html);
    }

}
