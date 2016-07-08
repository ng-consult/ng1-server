/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var angularDomServer = require('./../../../server/lib/AngularServerRenderer');
var vhost = require('vhost');
var path = require('path');

var server = express();
var appClient = express();
var appServer = express();


appClient.set('views', __dirname + '/views');
appClient.set('view engine', 'jade');

appClient.use(express.static( path.resolve(__dirname + '/../../../')));
appClient.use('/views', express.static( path.resolve(__dirname + '/../../../src/views')));
appClient.use('/dist', express.static( path.resolve(__dirname + '/../../../dist/client')));


appClient.get("*", function(req, res, next) {
    var url = req.url;
    console.log('API SERVER REQUESTING ', url);
    next();
});


appClient.get('/*', function(req, res, next) {
    // Compile the template to a function string
    res.render('index-no-server');
});



var config = require('./../../../server/config');
var angularServer = new angularDomServer(config);

appServer.set('views', __dirname + '/views');
appServer.set('view engine', 'jade');
appServer.use(express.static( path.resolve(__dirname + '/../../../')));
appServer.use('/views', express.static( path.resolve(__dirname + '/../../../src/views')));
appServer.use('/dist', express.static( path.resolve(__dirname + '/../../../dist/client')));
appServer.get('/*', function(req, res, next) {

    var jade = require('jade');

    // Compile the template to a function string
    var url = req.url;

    console.log(req);
    var jadeAngularHtml = jade.renderFile('./views/angular.jade', {});

    console.log('jadeAngularHtml', jadeAngularHtml);

    var html = angularServer.render(jadeAngularHtml, url);
    console.log('html', html);

    res.render('index', { angularServerHtml: html });
});


// add vhost routing to main app for mail
server.use(vhost('noserver.example', appClient));
server.use(vhost('server.example', appServer));

server.set('port', 3000);
server.listen(server.get('port'));
console.log('server started on noserver.example:3000 ');

/*

var angularServer = angularDomServer.init(config);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/index.html', function(req, res, next) {

    // Compile the template to a function string
    var url = getPageUrl();

    var jadeAngularHtml = jade.renderFile('./views/angular.jade', options);

    var html = angularServer.render(jadeAngularHtml, url);

    res.render('index', { angularServerHtml: html });
});
*/