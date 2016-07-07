/**
 * Created by antoine on 25/02/16.
 */
var fs = require('fs');
var _ = require('lodash');
var glob = require("glob");

/**
 *
 * Takes
 *
 *
 * @constructor
 */
var ServerConfig = function() {

    var _jsFiles = [];

    var _staticFolders = [];
    var _viewFolders = [];

    var _logPath = null;
    var _pidPath = null;

    var _angularName = null;
    var _serverName = null;

    var _port = 3000;
    var _index_html = null;
    var _timeout = 5000;

    var _selector = null;

    var _cacheEnabled = false;
    var _cachePath = null;

    var _validRegex = [];
    var _invalidRegex = [];
    var _validString = [];
    var _invalidString = [];


    // Log Getters
    this.getLogPath = function() {return _logPath;};
    this.getPidPath = function() {return _pidPath;};

    // Names getter
    this.getAngularName = function() { return _angularName;};
    this.getServerName = function() {return _serverName;};

    // Server Getters
    this.getStaticFolders = function() {return _staticFolders;};
    this.getViewFolders = function() {return _viewFolders;};
    this.getJavascriptFiles = function() {return _jsFiles;};


    this.getPort = function() {return _port;};
    this.getServerTimeout = function() {return _timeout;};
    this.getIndex = function() {return _index_html;};
    this.getSelector = function() { return _selecteor;}


    // Cache Getters
    this.isCacheEnabled = function() {return _cacheEnabled;};
    this.getCachePath = function() {return _cachePath;};

    this.getValidString = function(){return _validString;};
    this.getInvalidString = function() { return _invalidString;};

    this.shouldBeCached = function(url) {
        if (_validRegex.length > 0 && _invalidRegex.length > 0) {
            throw ' Should either one of valid or invalid stratgey should be chosen';
        }

        if (_validRegex.length === 0 && _invalidRegex.length === 0) {
            return true;
        }
        _invalidRegex.forEach(function (regex) {
            if (regex.test(url)) {
                return false;
            }
        });

        _validRegex.forEach(function (regex) {
            if (regex.test(url)) {
                return true;
            }
        });

        return true;

    };

    // Setters
    this.addJavascriptFiles = function(files) {
        validateFileArray(files);
        files = _.difference(files, _jsFiles);

        files.forEach( function(file) {
            _jsFiles.push(file);
        });
    };


    /**
     * @param config {object}
     *
     *      // Required
     *      // String
     *      angular_name: null
     *
     *      // Required
     *      // string
     *      log_path: null,
     *
     *      // Required
     *      // String
     *      pid_path: null
     *
     *      // Required
     *      // String
     *      //server_name: null
     *
     *      // Required
     *      // String
     *      // URL or File Path of the AngularApp HTML page
     *      index_html: null,
     *
     *      // Port
     *      port: 3004,
     *
     *      // HostName [^[a-z]+[\._[0-9a-zA-Z]]*i
     *      // Serves html views staticaly
     *      // Supports AngularJsDom html5mode = true
     *      net_root: localhost
     *
     *      // Boolean
     *      // Enables jsdom pre-rendering
     *      pre_render: true,
     *
     *      // String
     *      // Either the string 'document', or dome element ID
     *      bootstrap_selector: 'document',
     *
     *      //////////////
     *      //  DREAMING
     *      //////////////
     *
     *      // Boolean
     *      // If set to true
     *      // Removes all inile javascript and javascrit files from the html output
     *      // Removes all native ng directives
     *      // Removes all Angular native css classes
     *      // Good for testing
     *      // Good for comparing page loading speed
     *      disable_javascript: false,
     *
     *      // Dreaming
     *      // Enable caching,
     *      // By default, cache all urls
     *      cache: false,
     *      cache_method: file, // only file, should ideally be memcache|redis|file
     *      cache_folder: null,
     *
     *      // Milliseconds
     *      // Disable remove the ng-app && disable the native angular.bootstrap()
     *      // Simulate the native angular.js bootstrap after bootstrap_timeout
     *      bootstrap_timeout: 0,
     *
     *
     *
     */
    this.setServerConfig = function(configJSON) {
        _serverConfig = Object.assign(
            {
                angular_name: null,
                log_path: null,
                pid_path: null,
                index_html: null,
                port: 3004,
                net_root: 'localhost',
                pre_render: true,
                bootstrap_selector: 'document'
            }, config
        );
    }

    /**
     *
     * This is an array of system file paths where all the html view files are stored
     * It can be an empty array if all the views are inline
     * The internal express server will server these files on
     * _serverConfig.net_root
     *
     * @param paths [string]
     */
    this.addViewPaths = function(paths) {
        validateFileArray(paths);
        paths = _.intersection(paths, _viewPaths);
        paths.forEach( function(path) {
            _viewPaths.push(path);
        });
    };

    /**
     *
     * @param regex string|RegExp
     */

    this.disableUrlRule = function(regex) {
        _invalidString.push(regex);
        if ( typeof regex !== 'RegExp' ) {
            regex = new RegExp(regex);
        }
        _invalidRegex.push(regex);
    };

    /**
     *
     * @param regex string|RegExp
     */
    this.enableUrlRule = function(regex) {
        _validString.push(regex);
        if ( typeof regex !== 'RegExp' ) {
            regex = new RegExp(regex);
        }
        _validRegex.push(regex);
    };


    this.validateServerConfig = function() {};


    var validateFileArray = function(files, type) {
        files.forEach(function(file) {
            validateFilePath(file);
        })
    };

    var validateFilePath = function(file) {
        
        if (!fs.existsSync( file)) {
            throw new Error('This file doesn\'t exist: ' + file);
        }
    };

};

module.exports = ServerConfig;