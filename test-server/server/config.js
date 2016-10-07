/**
 * Created by antoine on 07/07/16.
 */
var path = require('path');

module.exports = {
    name: "myApp",
    log: {
        dir: path.resolve( __dirname + './../log/'),
        log: {
            enabled: true,
            stack: false
        },
        warn: {
            enabled: true,
            stack: false
        },
        error: {
            enabled: true,
            stack: true
        },
        info: {
            enabled: true,
            stack: false
        },
        debug: {
            enabled: true,
            stack: false
        },
        serverLogFile: 'angular.server'
    },
    server: {
        domain: "http://localhost:3000/",
        debug: true,
        timeout: 60,
        jsdomConsole: "log",
        base: "/",
        storageConfig: {
            "host": "127.0.0.1",
            "port": 6379,
            "socket_keepalive": true
        }
    },
    render: {
        strategy: "always",
        rules: [
            "/.*/"
        ]
    },
    serverCache: {
        "default": "always",
        "maxAge": [],
        "always": [],
        "never": []
    },
    restCache: {
        "default": "never",
        "maxAge": [],
        "always": [],
        "never": []
    },
    jsdomCache: {
        "default": "never",
        "maxAge": [],
        "always": [],
        "never": []
    }
};
