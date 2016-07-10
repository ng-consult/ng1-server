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
            path.resolve( __dirname + './../build-angular-engine') + '/angular.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-animate.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-aria.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-cookies.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-loader.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-message-format.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-messages.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-resource.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-route.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-sanitize.js',
            path.resolve( __dirname + './../build-angular-engine') + '/angular-touch.js',
            path.resolve( __dirname + './../dist/client') + '/*.js'
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
