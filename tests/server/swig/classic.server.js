/**
 * Created by antoine on 08/07/16.
 */
/**
 * Created by antoine on 07/07/16.
 */

var express = require('express');
var path = require('path');

var swig = require('swig');

var appClient = express();

//view renderer
appClient.engine('html', swig.renderFile);
appClient.set('view engine', 'html');

appClient.set('views', __dirname + '/views');

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
    res.render('index-classic');
});


module.exports = appClient;