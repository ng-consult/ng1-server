/**
 * Created by antoine on 15/02/16.
 */
var path = require('path');

exports.clientConfig = {
    app: {
        name: 'myApp',
        type: 'document' //can be id or document
    },
    bootstrap: false //if set to number, will bootstrap after setTimeout(number)

};

exports.cacheConfig = {
    dir: path.resolve( __dirname + '/cache' ),
    urls: [
        {
            regex: '.*',
            cache: true
        }
    ]
};

exports.serverConfig = {
        appname: 'myApp',
        timeout: 60000,
        port: 3002,
        views: {
            viewRoot: './../src/views',
            viewRegex: /\.html/i
        },
        logFiles: {
            log:  path.resolve( './logs/log.log'),
            warn: path.resolve( './logs/warn.log'),
            info: path.resolve('./logs/info.log'),
            error: path.resolve('./logs/error.log')
        }

};
