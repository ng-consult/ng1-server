/**
 * Created by antoine on 15/07/16.
 */
"use strict";

var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var utils = require('./utils');
var debug = require('debug')(utils.debugStr);

const serverConfig = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname + './../../bin/configYaml/serverConfig.yml')), 'utf-8');

const cacheServerURL = serverConfig.socketServers.fff.protocol + serverConfig.socketServers.fff.host + ':' + serverConfig.socketServers.fff.port;


utils.startWebServers(cacheServerURL, function(err, runningServers) {
    if(err) {
        throw err;
    }
    debug('nb started servers', runningServers.length);
    const configPath = path.resolve(__dirname + './../../bin/configYaml');
    utils.startNgServer(configPath, err => {
        if(err) {
            throw err;
        }
        debug('ngServer started');
    })
});

