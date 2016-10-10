"use strict";

var cacheServer = require('./../dist/cacheServer').default;

var server = new cacheServer('http://localhost:3000', {
    type: 'redis',
    host: '127.0.0.1',
    port: 6379,
    socket_keepalive: true
}, (err) => {
    if(err) throw err;
});
