/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var angularDomServer = require('./../../../server/lib/AngularServerRenderer');
var vhost = require('vhost');
var path = require('path');
var classicServer = require('./classic.server');
var preRenderServer = require('./pre-render.server');

var server = express();

// add vhost routing to main app for mail
server.use(vhost('noserver.example', classicServer));
server.use(vhost('server.example', preRenderServer));

server.set('port', 3000);
server.listen(server.get('port'));

console.log('server started on noserver.example:3000 ');
console.log('server started on server.example:3000 ');