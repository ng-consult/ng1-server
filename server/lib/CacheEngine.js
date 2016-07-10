/**
 * Created by antoine on 26/02/16.
 */
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');


var cacheUrl = function(url, config) {
    var _config = config;
    var _currentUrl = url;
    var _currentFilePath = null;
    var _currentMaxAge = null;
    var _currentCategory = null;


    var isFileCached = function() {
        return fs.existsSync(_currentFilePath);
    };

    var getRegexTest = function( u ) {
        if ( (u.regex instanceof RegExp) === false) {
            throw new Error('The following is not a valid Regexp: ' + u.regex);
        }
        return u.regex.test(_currentUrl);
    };

    //return always|never|maxAge|timestamp|default
    var getCacheCategory = function() {
        var i;
        for (i in _config.cacheNever) {
            if (getRegexTest (_config.cacheNever[i]) === true) {
                _currentCategory = 'never';
                return;
            }
        }

        for (i in _config.cacheAlways) {
            if (getRegexTest (_config.cacheAlways[i]) === true) {
                _currentCategory = 'always';
                return true;
            }
        }

        for (i in _config.cacheMaxAge) {
            if (getRegexTest (_config.cacheMaxAge[i]) === true) {
                _currentCategory = 'maxAge';
                _currentMaxAge = _config.cacheMaxAge[i].maxAge;
                return true;
            }
        }

        for (i in _config.cacheTimestamp) {
            if (getRegexTest (_config.cacheTimestamp[i]) === true) {
                _currentCategory = 'timestamp';
                return true;
            }
        }

        _currentCategory = 'default';
    };

    var isCacheExpired = function() {
        if ( _currentCategory === 'maxAge' ) {
            if (_config.type === 'file') {
                var stats = fs.statSync( _currentFilePath );
                var nowTimestamp = new Date().getTime();
                var modificationTime = stats.mtime.getTime();
                var expiration = modificationTime + _currentMaxAge*1000;
                var diff = (nowTimestamp - expiration);
                return diff > 0;
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
        try {
            fs.unlinkSync( _currentFilePath );
        } catch (e) {}
    };

    this.isCached = function() {
        if (_config.type === 'none') {
            return false;
        }
        if (_config.type === 'file') {

            if ( _currentCategory === 'never') {
                removeFileCache();
                return false;
            }

            if ( fs.existsSync( _currentFilePath) === false) {
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
    console.log('New cacheUrl: ',  _currentUrl, _currentCategory);

    if( _config.type === 'file') {
        _currentFilePath = path.join( _config.fileDir, url );
    }


};
/**
 *
 * @param config {AngularServerConfig}
 */
module.exports = function(config) {

    var _config = config.cache;

    if (_config.type === 'file') {
        shell.mkdir('-p', _config.fileDir);
    }

    this.loadUrl = function(html, url){

        return new cacheUrl(url, _config);
    };

};