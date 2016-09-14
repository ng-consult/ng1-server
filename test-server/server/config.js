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
            stack: true
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
            stack: true
        }
    },
    server: {
        domain: '127.0.0.1',
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
        storageConfig: {
            type: 'file',
            dir: path.resolve( __dirname + './../cache')
        },
        cacheRules: {
            cacheMaxAge: [{
                regex: /.*/, //cache everyting
                maxAge: 10 //ttl = 10 seconds
            }],
            cacheAlways: [],
            cacheNever: [],
            default: 'always'
        }
    }
};
