'use strict';

import * as uuid from 'node-uuid';
import CCC_1 from './CCC_1';
import {AAA_MSG, BBB_MSG, BBB_ANSWER, CCC_MSG_1, CCC_1_TO_AAA_ANSWER, DDD_CLOSE_STATUS, DDD_URL_STATUS, AAA_QUERY, BBB_STATUS} from './MESSAGES';
import * as path from 'path';
import Spawner from './Spawner';
import {IServerConfig} from "./interfaces";

const slimerjs  = require('slimerjs');

const debug = require('debug')('ngServer');
interface pool {
    [key: string]: {
        socketId: string,
        query: AAA_QUERY,
        status: DDD_URL_STATUS,
        html?: string,
        pid?: number,
        exit: boolean,
        benchmark: {
            queued: number,
            started: number,
            closed: number
        }
    }
}

/*
const obj = new Proxy({}, {
    get: function(target, name) {
        if (!(name in target)) {
            console.log("Getting non-existant property '" + name + "'");
            return undefined;
        }
        return target[name];
    },
    set: function(target, name, value) {
        if (!(name in target)) {
            console.log("Setting non-existant property '" + name + "', initial value: " + value);
        }
        target[name] = value;
        return true;
    }
});
*/

export default class DDD {

    static order: string[] = [];

    static pool: pool = {};

    static maxConcurency = 10;

    static addRender(socketId: string, query: AAA_QUERY) {

        const uid = uuid.v4();

        DDD.pool[uid] = {
            query: query,
            socketId: socketId,
            status: DDD_URL_STATUS.QUEUED,
            exit: false,
            benchmark: {
                queued: Date.now(),
                started: 0,
                closed: 0
            }
        };

        DDD.order.push(uid);

        //todo uncomment this when ready to test DDD
        /*
        if( DDD.next() !== uid) {
            DDD.notify_CC_1(uid);
        }*/
    }

    //process the pool
    static next(): string {
        if( DDD.order.length === 0 || DDD.order.length === DDD.maxConcurency) {
            //TODO log in server notifying that pool is empty
            return null;
        }

        const nextUID = DDD.order.shift();
        DDD.pool[nextUID].status = DDD_URL_STATUS.STARTED;
        DDD.pool[nextUID].benchmark.started = Date.now();

        //todo put the correct parameters
        new DDD(nextUID, 'CCC2_DOMAIN', 100000000);
        DDD.notify_CC_1(nextUID);
        return nextUID;
    }

    static sendHTML_to_AAA(uid: string, html: string) {
        DDD.pool[uid].html = html;
        DDD.pool[uid].status = DDD_URL_STATUS.HTML;
        DDD.notify_CC_1(uid);

        if(DDD.pool[uid].exit) {
            delete DDD.pool[uid];
            DDD.next();
        }
    }

    static notify_CC_1(uid: string): void {
        if(typeof DDD.pool[uid] === 'undefined') {
            //log error
        } else {
            CCC_1.notifyAAA( DDD.pool[uid].socketId, {status:DDD.pool[uid].status} );
        }
    }

    static CCC_1_socketDisconnected(socketId: string) {

        //possible bug when the AAA closes the socket on HTML/ERROR before DDD receives the close information
        //Probably possible to use socket.id instead of uid
        for(var uid in DDD.pool) {
            if(DDD.pool[uid].socketId === socketId) {
                if(DDD.pool[uid].exit) {
                    delete DDD.pool[uid];
                    DDD.next();
                }
                return;
            }
        }
    }

    /**
    static process_closed(uid, child_process_close_status) {
        switch(child_process_close_status) {
            case DDD_CLOSE_STATUS.JS_ERROR:
            case DDD_CLOSE_STATUS.REDIS_ERROR:
            case DDD_CLOSE_STATUS.SERVER_EROR:
            case DDD_CLOSE_STATUS.TIMEOUT:
                DDD.pool[uid].status = DDD_URL_STATUS.ERROR;
                break;
            case DDD_CLOSE_STATUS.SUCCESS:
                //DDD.pool[uid].status = DDD_URL_STATUS.HTML;
                //do nothing, HTML is sent vi sendHTML
                break;
        }
        DDD.notify_CC_1(uid);
    }*/

    constructor(private uid: string, private CCC_2_url: string, private timeout: number) {
        const spawner = new Spawner(this.uid, slimerjs.path, null);

        spawner.setParameters([
            path.join(__dirname, 'simplePhantomScript.js'),
            this.uid,
            "" + this.CCC_2_url,
            "" + this.timeout
        ]);

        DDD.pool[this.uid].pid = spawner.launch( false, () => {}, this.onProcessExit);

        setTimeout(() => {
            this.onProcessExit(1977, null);
            spawner.exit();
            //todo make sure we kill the pid too
        }, this.timeout);
    }


    private onProcessExit(code: number, signal: string) {
        DDD.pool[this.uid].benchmark.closed = Date.now();
        if( code === 1977 ) {
            //Log server for timeout sent when timeoued out from DDD's context
        }
        if( code !== 0 ) {
            DDD.pool[this.uid].status = DDD_URL_STATUS.ERROR;
            DDD.notify_CC_1(this.uid);
            delete DDD.pool[this.uid];
            DDD.next();
        } else {
            if(DDD.pool[this.uid].status === DDD_URL_STATUS.HTML) {
                delete DDD.pool[this.uid];
                DDD.next();
            } else {
                DDD.pool[this.uid].exit = true;
            }
        }
    }
}
