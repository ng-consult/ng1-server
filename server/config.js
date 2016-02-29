/**
 * Created by antoine on 15/02/16.
 */

var fs = require('fs');
var path = require('path');

var AngularServerConfig = require('./lib/AngularServerConfig');

var angularServerConfig = new AngularServerConfig( fs,readFileSync( path.resolve(__dirname + './config.json') ) );

angularServerConfig.addJavascriptFiles([path.resolve('./../dist/client/app.js')]);

angularServerConfig.addViewPaths([path.resolve('./../src/views')]);

angularServerConfig.validateServerConfig();

module.exports = angularServerConfig;