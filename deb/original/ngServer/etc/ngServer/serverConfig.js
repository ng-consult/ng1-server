var path = require('path');


var app = exports = module.exports  = {
    domain: 'http://localhost:3000',
    timeout: 10,
    logBasePath: path.resolve(__dirname + './../../logs'),
    gelf: {
        enabled: true,
        host: '127.0.0.1',
        port: 12203
    },
    socketServers: {
        ccc_1: { //bridge
            protocol: 'http://',
            host: '127.0.0.1',
            port: 8881
        },
        ccc_2: { //bridge
            protocol: 'http://',
            host: '127.0.0.1',
            port: 8882
        },
        fff: { // slimer & rest cache web server
            protocol: 'http://',
            host: '127.0.0.1',
            port: 8883
        }
    },
    redisConfig: {
        host: '127.0.0.1',
        port: 6379,
        socket_keepalive: true
    }
}