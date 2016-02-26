/**
 * Created by antoine on 16/02/16.
 */
var express = require('express');
var fs = require('fs');
var path = require('path');
var helmet = require('helmet');
var http = require('http');

var rootPath = __dirname + '/../../';

exports.getClientHtml = function() {
    return fs.readFileSync('index.es7.html', 'utf8');
};

exports.getServerHtml = function() {
    return fs.readFileSync('index.server.html', 'utf8');
};

exports.test = function() {
    var p = path.resolve( rootPath + '/dist/angular/server.js' );
    var data = fs.readFileSync(p , 'utf8');
    return eval( data);
};

exports.appStatic = function(app) {
    //app.use(helmet());
    app.get("*", function(req, res, next) {
        var url = req.url
        console.log('APP REQUESTING ', url);
        if ( /\.html/i.test(url) ) {
            //this is a view
            console.log('Getting the view ', url);
        }
        next();
    });

    app.use("/dist", express.static(rootPath + "/dist/client"));
    app.use("/views", express.static(rootPath + "/src/views"));
    //app.use("/node_modules", express.static(rootPath + "/node_modules"));
    app.use("/build-angular-engine", express.static(rootPath + "/build-angular-engine"));

    /*app.get('/', function(req, res, next) {
     var data = getClientHtml();
     return res.end(data);
     });*/

    app.get('/favicon.ico', function(req, res, next) {
        return res.send('');
    });

    return app;
};

exports.appServer = function() {
    var app = express();
    return app;
};

exports.appREST = function(app) {

    app.get("*", function(req, res, next) {
        var url = req.url
        console.log('APP REQUESTING ', url);
        if ( ! /\.html/i.test(url) ) {
            //this is a view
            console.log('This is probably a rest API call ', url);
        } else {
            console.log('This is a view call ', url);
        }
        next();
    });

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

    app.get('//products', function(req, res, next) {
        return getProducts(req, res);
    });

    app.get('/products', function(req, res, next) {
        return getProducts(req, res);
    });

    return app;
};