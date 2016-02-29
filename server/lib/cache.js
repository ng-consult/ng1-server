/**
 * Created by antoine on 26/02/16.
 */


/**
 *
 * @param config {AngularServerConfig}
 */
module.exports = function(config) {
    this.cacheConfig = config;
    var that = this;

    this.isCached = function(url) {
        return fs.existsSync(path.join( this.cacheConfig.getCachePath(), url));
    };

    this.getCached = function(url) {
        return fs.readFileSync(path.join(this.cacheConfig.getCachePath(), url));
    };

    this.cacheIt = function(url, html) {
        if ( !this.cacheConfig.isCacheEnabled() ) {
            return false;
        }

        this.removeCache(url);

        var that = this;

        this.cacheConfig.getCacheUrls.forEach( function( u ) {
            var re;
            if (typeof u.regex !== 'RegExp') {
                re = new RegExp(u.regex);
            } else {
                re =  u.regex;
            }

            try {
                if ( u.cache && re.test(url)) {
                    fs.writeFileSync( path.join(that.cacheConfig.getCachePath(), url), html );
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
            fs.unlinkSync( path.join(this.cacheConfig.getCachePath(), url) );
        }
    }
}