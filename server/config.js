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
            path.resolve( __dirname + './../build-angular-engine/angular.js'),
            path.resolve( __dirname + './../build-angular-engine/angular-resource.js'),
            path.resolve( __dirname + './../build-angular-engine/angular-route.js'),
            path.resolve( __dirname + './../dist/client/app.js')
        ]
    },
    cache: {
        type: 'file',
        fileDir: path.resolve( __dirname + '/cache'),
        cacheMaxAge: [],
        cacheAlways: [],
        cacheNever: [{
            regex: /.*/
        }],
        cacheTimestamp: []
    }
};
