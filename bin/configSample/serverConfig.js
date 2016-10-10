var path = require('path');


var app = exports = module.exports  = {
    domain: 'http://localhost:3000',
    timeout: 10,
    logBasePath: path.resolve(__dirname + './../logs'),
    socketServers: {
        bbb: {
            host: '127.0.0.1',
            port: 8888
        },
        ccc_1: {
            host: '127.0.0.1',
            port: 8889
        }
    },
    redisConfig: {
        host: '127.0.0.1',
        port: 6379,
        socket_keepalive: true
    }
}