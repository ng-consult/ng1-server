/**
 * Created by antoine on 07/07/16.
 */
var path = require('path');

module.exports = {
    name: "myApp",
    log: {
        log: {
            path: path.resolve( __dirname + './../log/log'),
            stack: false
        },
        warn: {
            path: path.resolve(__dirname + './../log/warn'),
            stack: true
        },
        error: {
            path: path.resolve( __dirname + './../log/error'),
            stack: true
        },
        info: {
            path: path.resolve( __dirname + './../log/info'),
            stack: false
        },
        debug: {
            path: path.resolve( __dirname + './../log/debug'),
            stack: true
        }
    },
    server: {
        domain: 'server.example',
        port: 3000,
        timeout: 15000
    },
    render: {
        strategy: 'include',
        rules: [
            /.*/ // render everything
        ]
    },
    cache: {
        type: 'file',
        fileDir: path.resolve( __dirname + './../cache'),
        cacheMaxAge: [{
            regex: /.*/, //cache everyting
            maxAge: 10 //ttl = 10 seconds
        }],
        cacheAlways: [],
        cacheNever: [],
        cacheTimestamp: []
    }
};
