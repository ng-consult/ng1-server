/**
 * Created by antoine on 08/07/16.
 */
/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var path = require('path');
var favicon = require('express-favicon');
var jade = require('jade');

var angularDomServer = require('./../../../server/lib/AngularServerRenderer');
var config = require('./../config');

var appServer = express();
appServer.use(favicon(__dirname + '/favicon.ico'));

var angularServer = new angularDomServer(config);

appServer.set('views', __dirname + '/views');
appServer.set('view engine', 'jade');

appServer.use('/public', express.static( path.resolve(__dirname + '/../../../tests/bower')));
appServer.use('/views', express.static( path.resolve(__dirname + '/../../../src/views')));
appServer.use('/dist', express.static( path.resolve(__dirname + '/../../../dist/client')));

appServer.get('/*', function(req, res, next) {

    var jadeAngularHtml = jade.renderFile('./views/angular.jade', {});

    var html = angularServer.render(jadeAngularHtml, req.url);

    html.then(function(result) {
        //console.log('html promise ok', result);
        res.render('index-pre-render', { angularServerHtml: result });
    }).fail(function(err) {
        //console.log('html promise fail', err);
        res.render('index-pre-render', { angularServerHtml: err });
    });

});

module.exports = appServer;