'use strict';

import * as io from 'socket.io-client';
import {MSG, PARAM_CLIENT_REQUEST, PARAM_RENDER_STATUS, ENUM_CACHE_STATUS, PARAM_CLIENT_ANSWER, ENUM_RENDER_STATUS} from './MESSAGES';
import {Request, Response} from "express-serve-static-core";
const debug = require('debug')('ngServer-Client');

class Client {

    private socket: SocketIOClient.Socket;

    constructor(private CCC_Domain:string) {
        this.socket = io.connect(this.CCC_Domain);
        this.socket.on('connect', () => {
            debug('Client connected to Bridge');
        });
    }

    middleware(req: Request, res: Response, next: Function) {
        debug('MiddleWare called with URL ', req.url);

        if (req.method !== 'GET') {
            next();
        }
        if (req.xhr === true) {
            next();
        }
        if (/text\/html/.test(req.get('accept')) !== true) {
            next();
        }

        var send = res.send.bind(res);

        res.send = (body) => {
            if (typeof body === 'string') {
                //todo prepend the domain to the url
                this.renderHTML(req.url, body, function(response){
                   switch(response.status) {
                       case ENUM_CACHE_STATUS.HTML :
                           res.location(req.url);
                           res.status(200);
                           return send.apply(this, [response.html]);
                       default:
                           res.location(req.url);
                           res.status(200);
                           return send.apply(this, [body]);
                   }
                });
            } else {
                return send.apply(this, [body]);
            }
        };
        next();
    };

    renderURL(url:string, cb:Function):void {
        debug('Render URL called', url);
        this.socket.emit(MSG.CHECK_URL, url);
        this.socket.on(MSG.ANSWER, (response:PARAM_RENDER_STATUS) => {

            debug('Client Answer is', ENUM_CACHE_STATUS[response.status]);

            switch (response.status) {
                case ENUM_CACHE_STATUS.HTML :
                    debug('client: Closing socket');
                    this.socket.close();
                    cb({
                        status: ENUM_CACHE_STATUS.HTML,
                        html: response.html
                    });
                    break;
                case ENUM_CACHE_STATUS.NO_RENDER:
                    this.socket.close();
                    cb({
                        status: ENUM_CACHE_STATUS.NO_RENDER
                    });
                    break;
                case ENUM_CACHE_STATUS.RENDER_NO_CACHE:
                    this.askBridge({url: url, strategy: ENUM_CACHE_STATUS.RENDER_NO_CACHE}, cb);
                    break;
                case ENUM_CACHE_STATUS.RENDER_CACHE:
                    this.askBridge({url: url, strategy: ENUM_CACHE_STATUS.RENDER_CACHE}, cb);
                    break;
                case ENUM_CACHE_STATUS.ERROR:
                    throw response.err;
            }
        });
    }

    renderHTML(url: string, html: string, cb: Function): void {
        debug('renderHTML called', url);

       this.socket.emit(MSG.CHECK_URL, url);

        this.socket.on(MSG.ANSWER, (response:PARAM_RENDER_STATUS) => {

            switch (response.status) {
                case ENUM_CACHE_STATUS.HTML :
                    this.socket.close();
                    cb({
                        status: ENUM_CACHE_STATUS.HTML,
                        html: response.html
                    });
                    break;
                case ENUM_CACHE_STATUS.NO_RENDER:
                    this.socket.close();
                    cb({
                        status: ENUM_CACHE_STATUS.NO_RENDER
                    });
                    break;
                case ENUM_CACHE_STATUS.RENDER_NO_CACHE:
                    this.askBridge({url: url, strategy: ENUM_CACHE_STATUS.RENDER_NO_CACHE, html: html}, cb)
                    break;
                case ENUM_CACHE_STATUS.RENDER_CACHE:
                    this.askBridge({url: url, strategy: ENUM_CACHE_STATUS.RENDER_CACHE, html: html}, cb)
                    break;
                case ENUM_CACHE_STATUS.ERROR:
                    this.socket.close();
                    throw response.err;
            }
        });
    }

    private askBridge(query: PARAM_CLIENT_REQUEST, cb:Function) {
        debug('Emitting GET_URL from Client to Bridge');

        this.socket.on(MSG.RENDER_STATUS, (response:PARAM_CLIENT_ANSWER) => {
            debug('Response received from Bridge External', ENUM_RENDER_STATUS[response.status]);
            switch (response.status) {
                case ENUM_RENDER_STATUS.HTML:
                    debug('Client - closing socket');
                    this.socket.close();
                    return cb({
                        status: ENUM_RENDER_STATUS.HTML,
                        html: response.html
                    });
                case ENUM_RENDER_STATUS.STARTED:
                case ENUM_RENDER_STATUS.QUEUED:
                    break;
                case ENUM_RENDER_STATUS.ERROR:
                    this.socket.close();
                    return cb({
                        status: ENUM_CACHE_STATUS.ERROR
                    });
            }
        });

        this.socket.emit(MSG.GET_URL, query);

    }

}

export = Client;