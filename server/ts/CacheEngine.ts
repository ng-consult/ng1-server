/**
 * Created by antoine on 26/02/16.
 */
import crypto = require('crypto');
import fs = require('fs');
import path = require('path');
import shell = require('shelljs');
import {Config, CacheConfig, RegexRule} from './EngineConfig';

class cacheUrl {

    _currentFilePath: string;
    _currentCategory: string;
    _currentMaxAge: number;

    constructor(public currentUrl: string, public config: CacheConfig) {
        this._currentFilePath = null;
        this._currentMaxAge = null;
        this._currentCategory = null;

        // Init the object;
        this.getCacheCategory();
        //console.log('New cacheUrl: ',  _currentUrl, _currentCategory);

        if( this.config.type === 'file') {
            this._currentFilePath = path.join( this.config.fileDir, this.currentUrl );
        }
    }

    private isFileCached = () => {
        return fs.existsSync(this._currentFilePath);
    };

    private getRegexTest = (u: RegexRule) => {
        return u.regex.test(this.currentUrl);
    };

    //return always|never|maxAge|timestamp|default
    private getCacheCategory = () => {
        var i;
        for (i in this.config.cacheNever) {
            if (this.getRegexTest (this.config.cacheNever[i]) === true) {
                this._currentCategory = 'never';
                return;
            }
        }

        for (i in this.config.cacheAlways) {
            if (this.getRegexTest (this.config.cacheAlways[i]) === true) {
               this._currentCategory = 'always';
                return true;
            }
        }

        for (i in this.config.cacheMaxAge) {
            if (this.getRegexTest (this.config.cacheMaxAge[i]) === true) {
                this._currentCategory = 'maxAge';
                this._currentMaxAge = this.config.cacheMaxAge[i].maxAge;
                return true;
            }
        }

        for (i in this.config.cacheTimestamp) {
            if (this.getRegexTest (this.config.cacheTimestamp[i]) === true) {
                this._currentCategory = 'timestamp';
                return true;
            }
        }

        this._currentCategory = 'default';
    };

    private isCacheExpired = () => {
        if ( this._currentCategory === 'maxAge' ) {
            if (this.config.type === 'file') {
                var stats = fs.statSync( this._currentFilePath );
                var nowTimestamp = new Date().getTime();
                var modificationTime = stats.mtime.getTime();
                var expiration = modificationTime + this._currentMaxAge*1000;
                var diff = (nowTimestamp - expiration);
                return diff > 0;
            }
        }
        if (this._currentCategory === 'always' ) {
            return false;
        }
        if ( this._currentCategory === 'timestamp' ) {
            throw "TODO";
        }
    };

    private removeFileCache = () => {
        try {
            fs.unlinkSync( this._currentFilePath );
        } catch (e) {}
    };

    public isCached = () => {
        if (this.config.type === 'none') {
            return false;
        }
        if (this.config.type === 'file') {

            if ( this._currentCategory === 'never') {
                this.removeFileCache();
                return false;
            }

            if ( fs.existsSync( this._currentFilePath) === false) {
                return false;
            }

            if ( this.isCacheExpired() ) {
                this.removeFileCache();
                return false;
            }
            return true;
        }
    };

    public getCached = () => {
        if( this.config.type === 'file') {
            return fs.readFileSync(this._currentFilePath);
        }
    };

    public cacheIt  = (html, force) => {

        switch(this.config.type) {
            case 'none':
                return false;
            case 'file':
                if (force === true) {
                    fs.writeFileSync( this._currentFilePath, html );
                    return true;
                }

                if (this.isFileCached()) {
                    return false;
                }
                if (this._currentCategory === 'never') {
                    return false;
                }
                fs.writeFileSync( this._currentFilePath, html );
                return true;
            default:
                throw 'Unexected value';
        }
    };

    public removeCache = () => {
        if (this.config.type === 'file') {
            this.removeFileCache();
        }
    };
}
/**
 *
 * @param config {AngularServerConfig}
 */

export default function(config: Config) {

    var _config = config.cache;

    if (_config.type === 'file') {
        shell.mkdir('-p', _config.fileDir);
    }

    this.loadUrl = (html, url) => {
        return new cacheUrl(url, _config);
    };

};