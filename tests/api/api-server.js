/**
 * Created by antoine on 08/07/16.
 */

var express = require('express');
var vhost = require('vhost');


var server = express();
var apiServer = express();


var getProducts = function(req, res) {
    setTimeout( function() {
        console.log('Sending back products');
        return res.end(JSON.stringify([
            {
                name: 'test',
                price: 1
            },
            {
                name: 'test2',
                price: 2,
            }]))
    },2000);
};

apiServer.get("*", function(req, res, next) {
    var url = req.url;
    console.log('API SERVER REQUESTING ', url);

    var oneof = false;
    if(req.headers.origin) {
        if (/noserver/.test(req.headers.origin)) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            oneof = true;
        }
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});


apiServer.get('//products', function(req, res, next) {
    return getProducts(req, res);
});

apiServer.get('/products', function(req, res, next) {
    return getProducts(req, res);
});


// add vhost routing to main app for mail
server.use(vhost('api.example', apiServer))

server.set('port', 8080);
server.listen(server.get('port'));
