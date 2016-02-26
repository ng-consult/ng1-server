/**
 * Created by antoine on 16/02/16.
 */

var Contextify = require('contextify');
var fs = require('fs');
var moment = require('moment');
var path = require('path');
var bunyan = require('bunyan');


var rootPath = __dirname + '/../';

/**
 *
 * @param appName string
 * @param type strinf
 */
exports.getLogFile = function(appName, type) {

    var logRootPath = path.resolve(__dirname + '/logs/' + appName + '/');
    if ( !fs.existsSync(logRootPath) ) {
        throw new Error(' The path ', logRootPath, ' does\'t exist. Create it to continue');
    }
    console.log( fs.statSync(logRootPath) );

    var log = bunyan.createLogger(
        {
            name: appName + '.' + type,
            streams: [
                {
                    level: 'info',
                    stream:  path.resolve(logRootPath + '/info.log' )
                },
                {
                    level: 'error',
                    src: true,
                    path: path.resolve(logRootPath + '/error.log' )
                },
                {
                    level: 'debug',
                    path: path.resolve(logRootPath + '/debug.log' )
                },
                {
                    level: 'warn',
                    src: true,
                    path: path.resolve(logRootPath + '/warn.log' )
                }
            ],
            serializers: bunyan.stdSerializers
        }
    );

    log.log = function() {
        return log.debug(arguments);
    }

    return log;
};



exports.getClientJS = function() {
    var files = [

       // path.resolve( rootPath + '/build-angular-engine/angular.js' ),
       // path.resolve( rootPath + '/build-angular-engine/angular-resource.js' ),
       // path.resolve( rootPath + '/build-angular-engine/angular-route.js' ),
        path.resolve( rootPath + '/dist/client/app.js' ),
    ];
    var fileSrc = [];
    for(var i in files) {
        fileSrc[i] = fs.readFileSync(files[i] , 'utf8');
    }
    return fileSrc;
};

exports.getContext = function(){
    c_window = Contextify({
        console : console
    });
    c_window.window = c_window.getGlobal();
    c_window.window.fs = fs;
    return c_window;
}

//rendering = true;
//console.log(html)

exports.closeSession = function( c_window, window ) {
    if (!window) {
        throw 'No window provided';
    }
    window.close();
    if (c_window) {
        try {
            c_window.dispose();
        }
        catch (e) {
            console.error('c_window.dispose() error');
        }
    } else {
        console.error('No c_window provided');
    }
}

exports.cacheEngine = function(config) {
    this.cacheConfig = config;
    var that = this;

    this.isCached = function(url) {
        return fs.existsSync(path.join( this.cacheConfig.dir, url));
    };

    this.getCached = function(url) {
        return fs.readFileSync(path.join(this.cacheConfig.dir, url));
    };

    this.cacheIt = function(url, html) {
        this.removeCache(url);

        var re;
        var that = this;

        this.cacheConfig.urls.forEach( function( u ) {
            if (!u.cache || !u.regex) throw 'Missing cache or ergex argument in config';

            re = new RegExp(u.regex);
            try {
                if ( re.test(url) && u.cache) {
                    fs.writeFileSync( path.join(that.cacheConfig.dir, url), html );
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }

        });
        return false;
    };

    this.removeCache = function(url) {
        if (this.isCached(url)) {
            fs.unlinkSync( path.join(this.cacheConfig.dir, url) );
        }
    }
}

exports.getHTML = function(c_window, timeouts) {

    var scope = c_window.window.angular.element(c_window.document).scope();
    scope.$apply();

    var html = '<html id="myApp">'
        + c_window.window.document.children[0].innerHTML
        + '</html>';

    for (var i in timeouts) {
        clearTimeout( timeouts[i]);
    }
    return html;
};