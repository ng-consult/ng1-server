/**
 * Created by antoine on 07/07/16.
 */
var path = require('path');

module.exports = {
    name: "myApp",
    path: {
        log: path.resolve( __dirname + '/logs'),
        pid: path.resolve( __dirname + '/pids')
    },
    server: {
        domain: 'server.example',
        port: 3000,
        timeout: 15000,
        jsFiles: [
            path.resolve( __dirname + './../bower/angular') + '/angular.js',
            path.resolve( __dirname + './../bower/angular-resource') + '/angular-resource.js',
            path.resolve( __dirname + './../bower/angular-route') + '/angular-route.js',
            path.resolve( __dirname + './../../dist/client') + '/*.js'
        ]
    },
    cache: {
        type: 'file',
        fileDir: path.resolve( __dirname + '/cache'),
        cacheMaxAge: [{
            regex: /.*/,
            maxAge: 10
        }],
        cacheAlways: [],
        cacheNever: [],
        cacheTimestamp: []
    }
};
