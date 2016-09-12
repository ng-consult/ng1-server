/**
 * Created by antoine on 15/07/16.
 */
var favicon = require('express-favicon');
var express = require('express');
var path = require('path');
var cons = require('consolidate');

module.exports = function(app, viewEngine) {

    app.use(favicon(__dirname + '/favicon.ico'));

    app.use(function(req, res, next) {
        console.log('GET ', req.protocol + '://' + req.get('host') + req.originalUrl);
        next();
    });

    app.use('/public', express.static( path.resolve(__dirname + '/../../tests/bower')));
    app.use('/views', express.static( path.resolve(__dirname + '/../../client/views')));
    app.use('/dist', express.static( path.resolve(__dirname + '/../../dist/client')));
    app.use('/lib', express.static( path.resolve(__dirname + '/../../server/client/js')));

    switch(viewEngine){
        case 'swig':
            app.engine('html', cons.swig);
            app.set('view engine', 'html');
            break;
        case 'jade':
            app.engine('jade', cons.jade);
            app.set('view engine', 'jade');
            break;
        default:
            throw new Error('unknown templating');
    }
    
    app.set('views', path.resolve(__dirname + '/' + viewEngine + '/views'));

    return app;
};
