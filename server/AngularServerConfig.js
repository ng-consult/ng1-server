/**
 * Created by antoine on 25/02/16.
 */
var fs = require('fs');
var _ = require('lodash');


var ServerConfig = function() {

    var _jsFiles = [];
    var _logBasePath = null;
    var _serverConfig = {};
    var _viewPaths = [];
    var _appConfig = {};
    var _cacheEnabled = false;
    var _cachePath = null;
    var _cacheUrls = [];


    this.addJavascriptFiles = function(files) {
        validateFileArray(files);
        files = _.difference(files, _jsFiles);

        files.forEach( function(file) {
            _jsFiles.push(file);
        });
    };

    this.setLogBasePath = function(path) {
        validateFilePath(path);
        _logBasePath = path;
    };

    this.setServerConfig = function(config) {

        ['server', 'client'].forEach(function(key) {
            if (typeof config[key] !== 'object') {
                throw new Error('invalid server config');
            }
        });
        ['timeout', 'port'].forEach(function(key) {
            if (typeof config['server'][key] !== 'number') {
                throw new Error('invalid server config');
            }
        });
        if (typeof config.server.port !== 'number') {
            throw new Error('invalid server config');
        }
        _serverConfig = config;
    };

    this.addViewPaths = function(paths) {
        validateFileArray(paths);
        paths = _.intersection(paths, _viewPaths);
        paths.forEach( function(path) {
            _viewPaths.push(path);
        });
    };

    this.setAppOptions = function(config) {
        if (typeof config.name !== 'string') {
            throw new Error('InValid AppConfig format');
        }
        if (typeof config.bootstrap !== 'object') {
            throw new Error('InValid AppConfig format');
        }
        if (config.bootstrap.timeout && typeof config.bootstrap.timeout !== 'number') {
            throw new Error('InValid AppConfig format');
        }
        if (typeof config.bootstrap.selector !== 'string') {
            throw new Error('InValid AppConfig format');
        }
        _appConfig = config;
    };

    this.enableCache = function() {
        _cacheEnabled = true;
    };

    this.disableCache = function() {
        _cacheEnabled = false;
    };

    this.setCacheFolder = function(path) {
        validateFilePath(path);
        _cachePath = path;
    };

    this.addCacheRegexUrlRule = function(regex, cache) {
        var rule = {};
        if (typeof cache !== 'boolean') {
            throw new Error('addCacheregexUrlRule wrong cache parameter');
        }
        if (typeof regex === 'string') {
            try {
                rule.regex = new RegExp(regex);
            } catch (e) {
                throw new Error('Invalid regex string: ', regex);
            }
        }
        else if (typeof regex == 'RegExp') {
            rule.regex = regex;
        } else {
            throw new Error('Invalid parameters');
        }
        rule.cache = cache;
        _cacheUrls.push(rule);
    };

    this.validateServerConfig = function() {

        if (_jsFiles.length === 0) {
            throw new Error('No Javascript Files set');
        }
        if (_logBasePath === null) {
            throw new Error('No logBase Path set');
        }
        if (_serverConfig === null ) {
            throw new Error('No serverConfig set');
        }
        if (_viewPaths.length === 0) {
            throw new Error('No ViewsPath set');
        }
        if (_appConfig === null) {
            throw new Error('No appConfig set');
        }
        if (_cacheEnabled === true) {

            if (_cachePath === null) {
                throw new Error('No cachePath set');
            }
            if (_cacheUrls.length === 0 ) {
                throw new Error('No cache rule added');
            }
        }
    };


    var validateFileArray = function(files, type) {
        if (typeof files !== 'array') {
            throw 'invalid ' + type + ' files';
        }
        files.forEach(function(file) {
            validateFilePath(file);
        })
    };

    var validateFilePath = function(file) {
        if (typeof file !== 'string') {
            throw new Error('FilePath ' + file + ' is not a string');
        }
        if (!fs.existsSync( file)) {
            throw new Error('This file doesn\'t exist: ' + file);
        }
    };



};