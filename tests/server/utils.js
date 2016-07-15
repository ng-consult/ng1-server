/**
 * Created by antoine on 15/07/16.
 */
var favicon = require('express-favicon');
var express = require('express');
var path = require('path');

module.exports = function(app, viewEngine) {

    app.use(favicon(__dirname + '/favicon.ico'));

    app.use(function(req, res, next) {
        console.log('GET ', req.protocol + '://' + req.get('host') + req.originalUrl);
        next();
    });

    app.use('/public', express.static( path.resolve(__dirname + '/../../tests/bower')));
    app.use('/views', express.static( path.resolve(__dirname + '/../../client/views')));
    app.use('/dist', express.static( path.resolve(__dirname + '/../../dist/client')));

    app.set('views', path.resolve(__dirname + '/' + viewEngine + '/views'));
    app.set('view engine', viewEngine);

    return app;
};
