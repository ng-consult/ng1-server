/**
 * Created by antoine on 26/02/16.
 */
var crypto = require('crypto');
var fs = require('fs');

var cacheUrl = function(md5, url, config) {
    var _config = config;
    var _currentUrl = url;
    var _currentFilePath = null;



    var isFileCached = function() {
        return fs.existsSync(_currentFilePath);
    };

    var getRegexTest = function( u ) {
        var re;
        if (typeof u.regex !== 'RegExp') {
            re = new RegExp(u.regex);
        } else {
            re =  u.regex;
        }

        return re.test(_currentUrl);
    };

    //return always|never|maxAge|timestamp|default
    var getCacheCategory = function() {
        _config.cacheNever.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'never';
                return;
            }
        });
        _config.cacheAlways.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'always';
                return;
            }
        });
        _config.cacheMaxAge.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'maxAge';
                _currentMaxAge = u.maxAge;
                return;
            }
        });
        _config.cacheTimestamp.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'timestamp';
                return;
            }
        });
        _currentCategory = 'default';
    };


    var isCacheExpired = function() {
        if ( _currentCategory === 'maxAge' ) {
            if (_config.type === 'file') {
                var stats = fs.statSync( _currentFilePath );
                var modificationTime = stats.mtime.getTime();
                var expiration = modificationTime + _currentMaxAge;
                var nowTimestamp = new Date().getTime();
                return nowTimestamp > expiration;
            }
        }
        if (_currentCategory === 'always' ) {
            return false;
        }
        if ( _currentCategory === 'timestamp' ) {
            throw "TODO";
        }
    };


    var removeFileCache = function() {
        fs.unlinkSync( _currentFilePath );
    };


    this.isCached = function() {
        if (_config.type === 'none') {
            return false;
        }
        if (_config.type === 'file') {

            if ( fs.existsSync( _currentFilePath === false)) {
                return false;
            }
            if ( isCacheExpired() ) {
                removeFileCache();
                return false;
            }
            return true;
        }
    };

    this.getCached = function() {
        if( _config.type === 'file') {
            return fs.readFileSync(_currentFilePath);
        }
    };

    this.cacheIt = function(html, force) {

        switch(_config.type) {
            case 'none':
                return false;
            case 'file':
                if (force === true) {
                    fs.writeFileSync( _currentFilePath, html );
                    return true;
                }

                if (isFileCached()) {
                    return false;
                }
                if (_currentCategory === 'never') {
                    return false;
                }
                fs.writeFileSync( _currentFilePath, html );
                return true;
            default:
                throw 'Unexected value';
        }
    };

    this.removeCache = function() {
        if (_config.type === 'file') {
            removeFileCache();
        }
    };

    // Init the object;
    getCacheCategory();
    if( _config.type === 'file') {
        _currentFilePath = path.join( _config.fileDir, url + '__' + md5);
    }


};
/**
 *
 * @param config {AngularServerConfig}
 */
exports.cacheEngine = function(config) {

    var _config = config.cache;

    this.loadUrl = function(html, url){

        return new cacheUrl(crypto.createHash('md5').update(html).digest("hex"), url, _config);
    };

};