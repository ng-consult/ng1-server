/**
 * Created by antoine on 16/02/16.
 */
var express = require('express');
var fs = require('fs');
var path = require('path');
var helmet = require('helmet');
var http = require('http');
var config = require('./../config');


var rootPath = __dirname + '/../../';

exports.getClientHtml = function() {
    return fs.readFileSync( config.getClientIndex(), 'utf8');
}

exports.getServerHtml = function() {
    return fs.readFileSync(config.getServerIndex(), 'utf8');
};

exports.appStatic = function(app) {
    //app.use(helmet());
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

    var staticFolders = config.getStaticFolders();
    staticFolders.forEach = function( folder ) {
        app.use( folder, express.static());
    };
    //app.use("/dist", express.static(rootPath + "/dist/client"));

    var viewFolders = config.getViewFolders();
    viewFolders.forEach(function(folder) {
        app.use( folder, express.static());
    });

    // We shouldn't have to do that  - instead angular.js library should be in staticFolders
    //app.use("/build-angular-engine", express.static(rootPath + "/build-angular-engine"));

    /*
    app.get('/favicon.ico', function(req, res, next) {
        return res.send('');
    });
    */

    return app;
};

exports.appServer = function() {
    var app = express();
    return app;
};

exports.appREST = function(app) {

   
    return app;
};