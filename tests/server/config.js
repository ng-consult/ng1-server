/**
 * Created by antoine on 07/07/16.
 */
var path = require('path');

module.exports = {
    name: "myApp",
    log: path.resolve( __dirname + './../logs'),
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
