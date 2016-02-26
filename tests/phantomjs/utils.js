var request = require('request');
var phantom=require('node-phantom');
var fs = require('fs');
var path = require('path');
/**
 *
 * @param uri  string ex: /Main
 * @param type string client|server
 * @param method string request|phantomjs
 * @returns {string}
 */
var getFilePath = function(uri, type, method) {
    switch (type) {
        case 'client':
            return path.resolve(__dirname + '/CACHE/' + method + '/client/' + uri );
        case 'server':
            return path.resolve(__dirname + '/CACHE/' + method + '/server/' + uri );
        default:
            throw 'unknown '+type;
    }
};


var getUrl = function(uri, type) {
    if ( fs.existsSync(uri) ) {
        return 'file://' + uri;
    }
    switch (type) {
        case 'client':
            return 'http://localhost:3004/' + uri;
        case 'server':
            return 'http://localhost:3002/' + uri;
        default:
            throw 'unknown '+type;
    }
};



/**
 *
 * @param uri
 * @param type string server|client
 * @return {page}
 */
exports.phantomJS = function(uri, type, screenshot) {

    if (!screenshot) screenshot = false;

    phantom.create(function (err, ph) {
        return ph.createPage(function (err, page) {

            return page.open( getUrl(uri, type) , function (err, status) {
                if (err) {
                    throw err;
                }

                var steps = 0;

                var exit  =function() {
                    steps++;
                    if (steps === 2) {
                        page.close();
                        ph.exit();
                    }
                }

                page.property('content').then(function(content) {
                    fs.writeFileSync(getFilePath(uri, type, 'phantomjs'), content, {
                        flag: w
                    });
                    exit();
                });

                if (screenshot === true) {
                    page.onLoadFinished = function() {
                        page.render(getFilePath(uri, type, 'phantomjs') + '.png');
                        exit();
                    }
                }
            });
        });
    });
};


/**
 *
 * @param uri
 * @param type server|client
 */
exports.request = function(uri, type) {

    request( getUrl(uri, type), function (err, response, body) {
        if (err) {
            throw err;
        }
        if (response.statusCode !== 200) {
            throw 'uri ' + url + ' status = ' + response.statusCode;
        }
        fs.writeFileSync( getFilePath( uri, type, 'request'), body, {
            flag: 'w'
        } );

    });
};