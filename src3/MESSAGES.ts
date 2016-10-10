'use strict';
//MESSAGES
export  const AAA_MSG  ={
    CHECK_URL: 'CHECK_URL', //sends to BBB, expect BBB_MSG.ANSWER,
    GET_URL: 'GET_URL' //Sent to CCC
}

export const BBB_MSG = {
    ANSWER: 'ANSWER' //sends after receive CHECK_URL from AAA
}

export const CCC_MSG_1 = {
    RENDER_STATUS: 'RENDER_STATUS', //sent to AAA to update status
}


export const CCC_MSG_2  = {
    IDLE: 'IDLE', // Sends to CCC_1 when the idle is reached nd html is available
    CACHE_IT: 'CACHE_IT' //sends to BBB when Idle event is caught and HTML should be cached
}

export const EEE_MSG = {
    LOG: 'LOG', // Sends to CCC_2
    IDLE: 'IDLE' //Sends to CCC_2
}
//ANSWERS

export interface BBB_ANSWER {
    status: BBB_STATUS,
    html?: string
    err?: string
}

export interface CCC_1_TO_AAA_ANSWER {
    status: string,
    html?: string,
    queueLength?: number,
    error?: string,
    errorDetails?: string
}

//Queries

export interface AAA_QUERY {
    url: string,
    strategy: BBB_STATUS
}

export interface URL_QUERY extends AAA_QUERY {
    uid: string,
    query_time: number,
    start_time: number
}


// STATUS



export enum DDD_CLOSE_STATUS {
    SUCCESS,
    TIMEOUT,
    JS_ERROR,
    SERVER_ERROR,
    REDIS_ERROR
};

export enum DDD_URL_STATUS {
    STARTED, // process has been spawned
    QUEUED, // it is waiting on the queue
    HTML, // html has been rendered
    ERROR, // error hapened in the child_process
};

export enum BBB_STATUS {
    RENDER_CACHE, //this url has to be pre-rendered and cahced
    NO_RENDER, // this url is excluded from pre-rendering
    HTML, // this url has already been pre-render and is cached, here is teh result
    RENDER_NO_CACHE, // must be pre-rendered, but not cached
    ERROR //something wrong happened , probably during redis connection
};




