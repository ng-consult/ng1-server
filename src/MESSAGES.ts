'use strict';
//SOCKET MESSAGES

export const MSG = {
    // Client <-> Bridge
    CHECK_URL: 'CHECK_URL', //sends to Cache, expect BBB_MSG.PARAM_CLIENT_ANSWER,
    GET_URL: 'GET_URL', //Sent to Bridge
    ANSWER: 'PARAM_CLIENT_ANSWER', //sends after receive CHECK_URL from Client
    RENDER_STATUS: 'ENUM_CACHE_STATUS', //sent to Client to update status
    // WebApp -> Bridge
    IDLE: 'IDLE', // Sends to Bridge External when the idle is reached nd html is available
    LOG: 'LOG', // Sends to Bridge_S2
    // all
    ERROR: 'ERROR', //when so js error happens on the webapp client,
};

//SOCKET PARAMS

export interface PARAM_RENDER_STATUS {
    status: ENUM_CACHE_STATUS,
    html?: string
    err?: string
}

export interface PARAM_CLIENT_ANSWER {
    status: ENUM_RENDER_STATUS,
    html?: string,
    queueLength?: number,
    error?: string,
    errorDetails?: string
}

export interface PARAM_IDLE {
    html: string,
    uid: string,
    url: string,
    doctype: string,
    exportedCache: Object
}

export interface PARAM_SLIMER_ERROR {
    message: string,
    uid: string,
    trace: string[]
}

export interface PARAM_CLIENT_REQUEST {
    url: string,
    strategy: ENUM_CACHE_STATUS,
    html?: string,
    tmp?: string
}

export interface PARAM_WEBAPP_LOG {
    uid: string,
    type: string,
    args: any[]
}

// ENUMS STATUS

export enum ENUM_RENDER_STATUS {
    STARTED, // process has been spawned
    QUEUED, // it is waiting on the queue
    HTML, // html has been rendered
    ERROR, // error hapened in the child_process
};

export enum ENUM_CACHE_STATUS {
    RENDER_CACHE, //this url has to be pre-rendered and cahced
    NO_RENDER, // this url is excluded from pre-rendering
    HTML, // this url has already been pre-render and is cached, here is the result
    RENDER_NO_CACHE, // must be pre-rendered, but not cached
    ERROR
};

export enum ENUM_SLIMER_ERRORS {
    FILE_ACCESS_ERROR = 5,
    NETWORK_ERROR = 6,
    WEBAPP_ERROR = 7,
    LOGIC_ERROR = 8
};
