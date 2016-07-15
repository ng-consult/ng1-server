/**
 * Created by antoine on 15/07/16.
 */
var apiServer = require('./api/api-server');
var jadeServer = require('./jade/server');
var swigServer = require('./swig/server');

apiServer();
jadeServer(3000);
swigServer(3001);