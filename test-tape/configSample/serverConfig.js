var path = require('path');


var app = exports = module.exports  = {
    domain: 'http://localhost:3000',
    timeout: 10,
    logBasePath: path.resolve(__dirname + './../logs'),
    socketServer: {
        slimerApp: {
            host: '127.0.0.1',
            port: 8888
        },
        Service: {
            host: '127.0.0.1',
            port: 8889
        }
    },
    cacheServer: {
        host: '127.0.0.1',
        port: 8890
    },
    redisConfig: {
        host: '127.0.0.1',
        port: 6379,
        socket_keepalive: true
    }
}