'use strict';

import * as io from 'socket.io-client';
import {AAA_MSG, BBB_MSG, BBB_ANSWER, BBB_STATUS, CCC_MSG_1, CCC_1_TO_AAA_ANSWER} from './MESSAGES';

const debug = require('debug')('ngServer-AAA');

export default class AAA {

    private socket;

    constructor(private BBB_Domain:string, private CCC_Domain:string) {
    }

    renderURL(url:string, cb:Function):void {

        debug('Render URL called', url);
        this.askBBB(url, (response:BBB_ANSWER) => {
            switch (response.status) {
                case BBB_STATUS.HTML :
                    cb({
                        status: BBB_STATUS.HTML,
                        html: response.html
                    });
                    break;
                case BBB_STATUS.NO_RENDER:
                    cb({
                        status: BBB_STATUS.NO_RENDER
                    });
                    break;
                case BBB_STATUS.RENDER_NO_CACHE:
                    debug('HERE');
                    this.askCCC({url: url, type: BBB_STATUS.RENDER_NO_CACHE}, cb)
                    break;
                case BBB_STATUS.RENDER_CACHE:
                    this.askCCC({url: url, type: BBB_STATUS.RENDER_CACHE}, cb)
                    break;
                case BBB_STATUS.ERROR:
                    throw response.err;
            }
        });
    }

    private askCCC(query, cb:Function) {
        debug('AskCCC Called', this.CCC_Domain);
        this.socket = io.connect(this.CCC_Domain);

        this.socket.on('connect', () => {

            debug('AAA connected to CCC_1');

            this.socket.on(CCC_MSG_1.RENDER_STATUS, (response:CCC_1_TO_AAA_ANSWER) => {
                debug('response from BBB = ', response);

                switch (response.status) {
                    case 'HTML':
                        return cb({
                            status: 'RENDERED',
                            html: response.html
                        });
                    case 'STARTED':
                    case 'QUEUED':
                        break;
                    case 'ERROR':
                        return cb({
                            status: 'ERROR'
                        });
                }
            });

            this.socket.emit(AAA_MSG.GET_URL, query);

        });
    }

    private askBBB(url:string, cb:Function):void {
        this.socket = io.connect(this.BBB_Domain);

        this.socket.on('connect', () => {
            this.socket.emit(AAA_MSG.CHECK_URL, url);
            this.socket.on(BBB_MSG.ANSWER, (response:BBB_ANSWER) => {
                this.socket.close();
                cb(response);
            });
        });


    }
}