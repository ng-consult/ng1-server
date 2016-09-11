"use strict";
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var cacheUrl = (function () {
    function cacheUrl(currentUrl, config) {
        var _this = this;
        this.currentUrl = currentUrl;
        this.config = config;
        this.isFileCached = function () {
            return fs.existsSync(_this._currentFilePath);
        };
        this.getRegexTest = function (u) {
            return u.regex.test(_this.currentUrl);
        };
        //return always|never|maxAge|timestamp|default
        this.getCacheCategory = function () {
            var i;
            for (i in _this.config.cacheNever) {
                if (_this.getRegexTest(_this.config.cacheNever[i]) === true) {
                    _this._currentCategory = 'never';
                    return;
                }
            }
            for (i in _this.config.cacheAlways) {
                if (_this.getRegexTest(_this.config.cacheAlways[i]) === true) {
                    _this._currentCategory = 'always';
                    return true;
                }
            }
            for (i in _this.config.cacheMaxAge) {
                if (_this.getRegexTest(_this.config.cacheMaxAge[i]) === true) {
                    _this._currentCategory = 'maxAge';
                    _this._currentMaxAge = _this.config.cacheMaxAge[i].maxAge;
                    return true;
                }
            }
            for (i in _this.config.cacheTimestamp) {
                if (_this.getRegexTest(_this.config.cacheTimestamp[i]) === true) {
                    _this._currentCategory = 'timestamp';
                    return true;
                }
            }
            _this._currentCategory = 'default';
        };
        this.isCacheExpired = function () {
            if (_this._currentCategory === 'maxAge') {
                if (_this.config.type === 'file') {
                    var stats = fs.statSync(_this._currentFilePath);
                    var nowTimestamp = new Date().getTime();
                    var modificationTime = stats.mtime.getTime();
                    var expiration = modificationTime + _this._currentMaxAge * 1000;
                    var diff = (nowTimestamp - expiration);
                    return diff > 0;
                }
            }
            if (_this._currentCategory === 'always') {
                return false;
            }
            if (_this._currentCategory === 'timestamp') {
                throw "TODO";
            }
        };
        this.removeFileCache = function () {
            try {
                fs.unlinkSync(_this._currentFilePath);
            }
            catch (e) { }
        };
        this.isCached = function () {
            if (_this.config.type === 'none') {
                return false;
            }
            if (_this.config.type === 'file') {
                if (_this._currentCategory === 'never') {
                    _this.removeFileCache();
                    return false;
                }
                if (fs.existsSync(_this._currentFilePath) === false) {
                    return false;
                }
                if (_this.isCacheExpired()) {
                    _this.removeFileCache();
                    return false;
                }
                return true;
            }
        };
        this.getCached = function () {
            if (_this.config.type === 'file') {
                return fs.readFileSync(_this._currentFilePath);
            }
        };
        this.cacheIt = function (html, force) {
            switch (_this.config.type) {
                case 'none':
                    return false;
                case 'file':
                    if (force === true) {
                        fs.writeFileSync(_this._currentFilePath, html);
                        return true;
                    }
                    if (_this.isFileCached()) {
                        return false;
                    }
                    if (_this._currentCategory === 'never') {
                        return false;
                    }
                    fs.writeFileSync(_this._currentFilePath, html);
                    return true;
                default:
                    throw 'Unexected value';
            }
        };
        this.removeCache = function () {
            if (_this.config.type === 'file') {
                _this.removeFileCache();
            }
        };
        this._currentFilePath = null;
        this._currentMaxAge = null;
        this._currentCategory = null;
        // Init the object;
        this.getCacheCategory();
        //console.log('New cacheUrl: ',  _currentUrl, _currentCategory);
        if (this.config.type === 'file') {
            this._currentFilePath = path.join(this.config.fileDir, this.currentUrl);
        }
    }
    return cacheUrl;
}());
/**
 *
 * @param config {AngularServerConfig}
 */
function default_1(config) {
    var _config = config.cache;
    if (_config.type === 'file') {
        shell.mkdir('-p', _config.fileDir);
    }
    this.loadUrl = function (html, url) {
        return new cacheUrl(url, _config);
    };
}
exports.__esModule = true;
exports["default"] = default_1;
;
//# sourceMappingURL=CacheEngine.js.map