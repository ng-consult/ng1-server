/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var vhost = require('vhost');
var classicServer = require('./classic.server');
var preRenderServer = require('./pre-render.server');
var middlewareServer = require('./middleware.server');

module.exports = function(port) {
    var server = express();

    server.use(vhost('noserver.example', classicServer));
    server.use(vhost('server.example', preRenderServer));
    server.use(vhost('server-middleware.example', middlewareServer));

    server.set('port', port);
    server.listen(server.get('port'));

    console.log('server (swig) started on noserver.example:' + port);
    console.log('server (swig) started on server.example:' + port);
    console.log('server (swig) started on server-middleware.example:' + port);
};
