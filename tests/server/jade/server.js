
var express = require('express');
var vhost = require('vhost');
var classicServer = require('./classic.server');
var preRenderServer = require('./pre-render.server');
var middleWareServer = require('./middleware.server');

module.exports = function(port) {
    var server = express();

    server.use(vhost('noserver.example', classicServer));
    server.use(vhost('server.example', preRenderServer));
    server.use(vhost('server-middleware.example', middleWareServer));

    server.set('port', port);
    server.listen(server.get('port'));

    console.log('server (jade) started on noserver.example:' + port);
    console.log('server (jade) started on server.example:' + port);
    console.log('server (jade) started on server-middleware.example:' + port);
};
