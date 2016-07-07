/**
 * Created by antoine on 26/02/16.
 */
var configValidation = require('./configValidation');

/**
 *
 * @param config {AngularServerConfig}
 */
module.exports = function() {

    var _configLoaded = false;
    var _config = null;
    //current URL
    var _currentUrl = null;
    var _currentFilePath = null;
    var _currentCategory = null;
    var _currentMaxAge = null;


    var that = this;

    this.loadConfig = function(config) {
        var  configValid = configValidation(config);
        if(!configValid){
            throw new Error('Server config is invalid');
        }
        _configLoaded = true;
        _config = config.cache;
    };

    this.setCurrentUrl = function(url) {
        _currentUrl = url;
        getCacheCategory();
        if( _config.type === 'file') {
            _currentFilePath = path.join( this.cacheConfig.fileDir, url);
        }
    };


    var isFileCached = function() {
        if (_currentUrl === null) {
            throw new Error('Current Cached url not set');
        }
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
        this.cacheConfig.cacheNever.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'never';
                return;
            }
        });
        this.cacheConfig.cacheAlways.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'always';
                return;
            }
        });
        this.cacheConfig.cacheMaxAge.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'maxAge';
                _currentMaxAge = u.maxAge;
                return;
            }
        });
        this.cacheConfig.cacheTimestamp.forEach(function( u ) {
            if (getRegexTest (u) === true) {
                _currentCategory = 'timestamp';
                return;
            }
        });
        _currentCategory = 'default';
    };


    var isCacheExpired = function(url) {
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
    }


    this.isFileCached = function() {
        if ( fs.existsSync( _currentFilePath === false) {
            return false;
        }
        if ( isCacheExpired() ) {
            removeFileCache();
            return false;
        }
        return true;
    };

    this.getFileCached = function(url) {
        return fs.readFileSync(_currentFilePath);
    };

    this.cacheIt = function(html, force) {

        switch(this.cacheConfig.type) {
            case 'none':
                return false;
            case 'file':
                if (force === true) {
                    fs.writeFileSync( _currentFilePath, html );
                    return true;
                }

                if (this.isFileCached()) {
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

}