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
            /Main/,
            /Todo/
        ]
    },
    cache: {
        type: 'file',
        fileDir: path.resolve( __dirname + './../cache'),
        cacheMaxAge: [{
            regex: /.*/,
            maxAge: 10
        }],
        cacheAlways: [],
        cacheNever: [],
        cacheTimestamp: []
    }
};
