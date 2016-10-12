'use strict';

import * as uuid from 'node-uuid';
import Bridge_S1 from './bridge_S1';
import {MSG, ENUM_RENDER_STATUS, PARAM_CLIENT_REQUEST, ENUM_CACHE_STATUS} from './MESSAGES';
import * as fs from 'fs-extra';
import {IServerConfig, IDomainInfo, UrlPool} from "./interfaces";
import ServerLog from './serverLog';
import SlimerProcess from "./slimerProcess";

const slimerjs  = require('slimerjs');

const debug = require('debug')('ngServer-Bridge_Pool');


export default class Bridge_Pool {

    static order: string[] = [];

    static pool: UrlPool = {};

    static maxConcurency = 10;

    static serverConfig: IServerConfig;

    static init(serverConfig: IServerConfig) {
        Bridge_Pool.serverConfig = serverConfig;
    }

    static addRender(socketId: string, query: PARAM_CLIENT_REQUEST) {

        //todo uncomment this
        const uid = uuid.v4();
        //const uid = "a07f3f12-faa0-4363-830d-4a27a49d6e61";

        const logger = ServerLog.Log.child({uid: uid, script: 'Bridge_Pool'});

        debug('new UID cerated: ', uid , 'for query: ', query);

        Bridge_Pool.pool[uid] = {
            query: query,
            socketId: socketId,
            status: ENUM_RENDER_STATUS.QUEUED,
            exit: false,
            benchmark: {
                queued: Date.now(),
                started: 0,
                closed: 0
            }
        };

        logger.debug({pool: Bridge_Pool.pool[uid]}, 'new UID created: ' + uid );

        Bridge_Pool.order.push(uid);

        if( Bridge_Pool.next() !== uid) {
            Bridge_Pool.notify_CC_1(uid);
        }
    }

    //process the pool
    static next(): string {
        if( Bridge_Pool.order.length === 0 || Bridge_Pool.order.length === Bridge_Pool.maxConcurency) {
            ServerLog.Log.child({script: 'Bridge_Pool'}).warn('The processing pool is now empty');
            return null;
        }

        const nextUID = Bridge_Pool.order.shift();
        Bridge_Pool.pool[nextUID].status = ENUM_RENDER_STATUS.STARTED;
        Bridge_Pool.pool[nextUID].benchmark.started = Date.now();
        Bridge_Pool.pool[nextUID].spawner = new SlimerProcess(nextUID);
        Bridge_Pool.notify_CC_1(nextUID);
        return nextUID;
    }

    static sendHTML_to_Client(uid: string, html: string) {
        Bridge_Pool.pool[uid].html = html;
        Bridge_Pool.pool[uid].status = ENUM_RENDER_STATUS.HTML;
        Bridge_Pool.notify_CC_1(uid);

        //todo investigate

        if(Bridge_Pool.pool[uid].exit) {
            Bridge_Pool.deleteUID(uid);
            Bridge_Pool.next();
        }
    }

    static notify_CC_1(uid: string): void {
        if(typeof Bridge_Pool.pool[uid] === 'undefined') {
            //log error
        }
        if(Bridge_Pool.pool[uid].status === ENUM_RENDER_STATUS.HTML) {
            Bridge_S1.notifyClient( Bridge_Pool.pool[uid].socketId, uid, {
                status: ENUM_RENDER_STATUS.HTML,
                html:Bridge_Pool.pool[uid].html
            } );
        }
        else {
            Bridge_S1.notifyClient( Bridge_Pool.pool[uid].socketId, uid, {
                status:Bridge_Pool.pool[uid].status
            } );
        }
    }

    static CCC_1_socketDisconnected(socketId: string) {

        //possible bug when the Client closes the socket on HTML/ERROR before Bridge_Pool receives the close information
        //Probably possible to use socket.id instead of uid
        for(var uid in Bridge_Pool.pool) {
            if(Bridge_Pool.pool[uid].socketId === socketId) {
                if(Bridge_Pool.pool[uid].exit) {
                    //todo investigate
                    Bridge_Pool.deleteUID(uid);
                    Bridge_Pool.next();
                }
                return;
            }
        }
    }

    static deleteUID(uid: string) {
        debug('deleting uid ', uid);
        if(Bridge_Pool.pool[uid].query.tmp) {
            fs.removeSync(Bridge_Pool.pool[uid].query.tmp);
        }
        delete Bridge_Pool.pool[uid];
    }


    static generateFullURL(info: IDomainInfo): string{
        return info.protocol + info.host + ':' + info.port;
    }


}
