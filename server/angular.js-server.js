var md = require('cli-md');
var fs = require('fs');
var yargs = require('yargs');
var jsdom = require("jsdom");
var ads = require('./lib/AngularDomJs');
var config = require('./config');
var log = require('./lib/log');
var cache = require('./lib/cache');
var StackTrace = require('stacktrace-js');
var moment = require('moment');
var glob = require("glob")
var ExpressHelper = require('./express/express');

var cache = cache(config);
var argv = yargs.argv;
/****
 *
 * WE NEED A CONFIG
 *
 *  scripts: config.getJavascriptFiles(config),
    src: ads.getClientJS(config),


 */


var app = ExpressHelper.appServer();

ExpressHelper.appStatic(app);

ExpressHelper.appREST(app);

var name = argv.name ? argv.name : new Error('name not set');
var port = argv.port ? argv.port : 3002;
var logPath = argv.log ? argv.log : '/var/log/angular-server/';

var logPath = argv.log ? argv.log : '/var/log/angular-server/';
var type = argv.type ? argv.type : new Error('type is not set');
var jsdom = argv.jsdom ? true : false;
var log = utils.getLogFile(logPath, type);
var html = argv.html ? argv.html : new Error('html is not set');




app.get("*", function(req, res, next) {

  var url = req.url;

  c_window = ads.getContext();
  c_window.console = log;

  app.listen(port);


  //c_window.cacheEngine = cache;
  /*
  if (cache.isCached(url)) {
    //log() directly inside the angular Context
    log('rendering cached page for ', url);
    res.end ( cache.getCached(url) );
    return;
  }
  */

  if (jsdom) {


  } else {
      log.info(req.url);
      return res.end( ExpressHelper.getClientHtml() );
  });


    console.log('App listening on ', port, 'Access client on http://localhost:', port);
  }
        config = {
          file: html,
          scripts: config.getJavascriptFiles(config),
          src: ads.getClientJS(config),
          features: {
            FetchExternalResources :  false,
            ProcessExternalResources:  false
          },
          url: 'http://localhost:' + port + '/' + url,
          virtualConsole: jsdom.createVirtualConsole().sendTo(c_window.console),
          created: function (err, window) {
            if (err) {
              c_window.cacheEngine.removeCache(url);
              c_window.console.error('ERR CATCHED IN CREATED', err);
              return;
            }
            window.scrollTo = function () {};
            window.onServer = true;
            window.appName = name;
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



    })
    .demand(1)
    .help('help')
    .argv;


