var md = require('cli-md');
var fs = require('fs');
var yargs = require('yargs');
var jsdom = require("jsdom");
var utils = require('./utils');
var util = require('util');
var vm = require('vm');
var StackTrace = require('stacktrace-js');
var appConfig = require('./config');
var moment = require('moment');

var serverConfig = appConfig.serverConfig;
var clientConfig = appConfig.clientConfig;

var path = require('path');
var MDDoc = {};
MDDoc.server = fs.readFileSync( path.resolve(  './doc/cli.server.md')).toString();
MDDoc.client = fs.readFileSync( path.resolve(  './doc/cli.client.md')).toString();

var ExpressHelper = require('./express/express');

var app = ExpressHelper.appServer();

ExpressHelper.appStatic(app);

ExpressHelper.appREST(app);

yargs.usage('$0  [args]')
    .command('server', md(MDDoc.server) , function (yargs, argv) {

      var log = utils.getLogFile(serverConfig.appname, 'server');

      app.get("*", function(req, res, next) {

        var url = req.url;

        c_window = utils.getContext();
        c_window.console = log;
        c_window.cacheEngine = new utils.cacheEngine( appConfig.cacheConfig);

        if (c_window.cacheEngine.isCached(url)) {
          c_window.console.log('rendering cached page for ', url);
          res.end ( c_window.cacheEngine.getCached(url) );
          return;
        }

        config = {
          file: 'index.server.html',
          scripts: [
              "http://localhost:3002/build-angular-engine/angular.js",
              "http://localhost:3002/build-angular-engine/angular-resource.js",
              "http://localhost:3002/build-angular-engine/angular-route.js"
          ],
          src: utils.getClientJS(),
          features: {
            FetchExternalResources :  false,
            ProcessExternalResources:  false
          },
          url: 'http://localhost:3002' + url,
          virtualConsole: jsdom.createVirtualConsole().sendTo(c_window.console),
          created: function (err, window) {
            if (err) {
              c_window.cacheEngine.removeCache(url);
              c_window.console.error('ERR CATCHED IN CREATED', err);
              return;
            }
            window.scrollTo = function () {};
            window.onServer = true;
            window.fs = fs;
            window.logFiles = serverConfig.logFiles;
            window.clientConfig = clientConfig;
            window.addEventListener('error', function(err) {
              c_window.cacheEngine.removeCache(url);
              c_window.console.log('EVENT LISTENER ON ERROR CATCHED', err);
            });
          },
          done: function (err, window) {
            if (err) {
              //@todo manually write inside serverConfig.logFiles.error.path
              c_window.cacheEngine.removeCache(url);
              c_window.console.error('ERR CATCHED IN DONE', err);
              utils.closeSession(null, window);
              return;
            }

            c_window.window = Object.assign(c_window.window, window);


            var angularApp;
            switch (clientConfig.app.type) {
              case 'document':
                angularApp = c_window.angular.bootstrap(c_window.document, [ clientConfig.app.name ]);
                break;
              case 'id': //untested
                angularApp = c_window.angular.bootstrap(c_window.getElementById(clientConfig.app.name), [ clientConfig.app.name ]);
                break;
            }

            //var $log = angularApp.invoke( function($log) {return $log;} );
            var $window = angularApp.invoke( function($window) {return $window;});

            var rendering = false;


            $window.addEventListener('AngularContextException', function(e) {
              rendering = true;
              StackTrace.get()
                  .then(function(stack){
                    c_window.console.log('StackTrace.get', stack);
                  })
                  .catch(function(err){
                    c_window.console.log('StackTrace.catch', err);
                  });
              c_window.cacheEngine.removeCache(url);
              c_window.console.error("AngularContextException caught on server");
              c_window.console.error(e);
              utils.closeSession(c_window, window);
              res.end('SERVER-ERROR');
            });

            $window.addEventListener('IdleState', function () {
              c_window.console.log('IdleState event caught !');
              if (rendering) return;
              rendering = true;
              var html = utils.getHTML(c_window, [ serverTimeout ]);
              c_window.cacheEngine.cacheIt(url, html);
              utils.closeSession(c_window, window);
              c_window.console.log('server done');
              res.end ( html );
            });

            var serverTimeout = setTimeout(function() {
              if (rendering) return;
              c_window.console.error('SERVER TIMEOUT ! ! !');
              //@todo Get the error URl here
              rendering = true;
              const html = utils.getHTML(c_window, [ serverTimeout ]);
              utils.closeSession(c_window, window);
              c_window.cacheEngine.removeCache(url);
              res.end ( html );
            }, serverConfig.timeout);


          },
          document: {
            referer: '',
            cookie: 'key=value; expires=Wed, Sep 21 2011 12:00:00 GMT; path=/',
            cookieDomain: '127.0.0.1'
          }
        };
        jsdom.debugMode = false;
        jsdom.env(config);
      });

      app.listen(serverConfig.port);

      log.info('Server started on port ' + serverConfig.port);

      console.log('App listening on ', serverConfig.port, ' Access client on http://localhost:' + serverConfig.port);
    })
    .command('client', md(MDDoc.client), function() {

      var log = utils.getLogFile(clientConfig.app.name, 'client');

      app.get("*", function(req, res, next) {
        log.info(req.url);
        return res.end( ExpressHelper.getClientHtml() );
      });

      app.listen(3004);

      console.log('App listening on 3004, Access client on http://localhost:3004');
    })
    .demand(1)
    .help('help')
    .argv;


