/**
 * Created by antoine on 07/07/16.
 */

var jade = require('jade');
var express = require('express');
var angularDomServer = require('angularDomServer');

var app = express();
var angularServer = angularDomServer.init(config);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/index.html', function(req, res, next) {

    // Compile the template to a function string
    var url = getPageUrl();

    var jadeAngularHtml = jade.renderFile('./views/full_page.jade', options);

    var html = angularServer.render(jadeAngularHtml, url);

    res.render('index', { angularServerHtml: html });
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
