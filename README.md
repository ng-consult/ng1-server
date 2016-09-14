#Angular.JS-server  [![Build Status](https://travis-ci.org/a-lucas/angular.js-server.svg?branch=master)](https://travis-ci.org/a-lucas/angular.js-server)

##Introduction

Official site: https://a-lucas.github.io/angular.js-server/

AngularJS is an awesome framework designed to run Web Applications. SEO is usually not a requireemnt for web applications, and AngularJS is bad at SEO for the reason that the client doesnt see anything when the client receives the requests from the server.

##Comparing server prerendering with no prerendering

![MEAN.js HTML with Angular.js](screenshots/no-prerender.png)
**MEAN.js HTML with Angular.js**

![MEAN.js HTML with Angular.js-server](screenshots/prerender.png)
**MEAN.js HTML with Angular.js-server**

You can check this out by yourself at this url: https://github.com/a-lucas/mean

##Implication for Angular and SEO

Now that all web crawlers can parse the real content of the page, they can index it and show previews in their results.

`Angular.js` can now be used to create and design performant websites, and is not limited anymore to web-apps.

##Pros & Cons

### Pros: 

- It is quicker to develop a website from scratch with Angular than traditional Server Side technologies
- You have to slighly modify your existing code base to enable server side $http caching.
- Your website, once the page loaded, will behave as a web application - which means a much richer user experience
- You can server side cache REST API and templateCache and replay them them in your client with  (https://github.com/a-lucas/angular.js-server-ng-cache)

##Cons

- It is quite hard to debug Angular Errors when these happens on the server side - working on integration of stacktrace with sourcemaps
- Benchmarks are missing
- URL rewritting and redirection support is missing
- It is not really possible to define the URL caching strategy an dthe preprendering strategy in the `ui-router` & `ng-router` URL definition files, because it would force the engine te render he page one time to discover the config, and then the caching would be useless.
    
# Requirements

##html5mode

Your angular app must use html5mode. The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

So for example, rendering on the server side http://domain.com/url#blah will just render http://domain.com/url.

##Custom Angular $qFactory

You must use a modified version of AngularJS original $qFactory based  on the version `1.5.7`

*Why do I need a custom promise $q?*

In order to have the prerenderer working, I need to make sure that all the initial templates are loaded, and all the REST api calls are completed.
In short, I have to make sure that the Angular application is in IDLE state. And Angular1 doesn't trigger (yet) this idle state event.

This modified `$q` is included in the client side library - and the change should be totally transparent to you.

##Client Side library

The client side module is here: https://github.com/a-lucas/angular.js-server-bower


#Functionalities


##Caching

For caching, the package 'simple-cache-url` is used. 

It is possibel to cache the files on the file system, or in a REDIS datastore.

Caching is made trough URL Regex, and supports severall mode ( `never`, `always`, and `maxAge` ).

##$http caching & template caching

When rendering the HTML on the server, every templateRequest and REST call are cached and injected into the client before the angular app runs. 
Then all the requests are instantly replayed, decreasing considerably the client page loading time.

To use $http caching, you will need the package `angular.js-server-ng-cache` available at

```bash
bower install angular.js-server-ng-cache
```

##URL filtering

You can decide which URLs will be pre-rendered, and uses either of the two strategies `include` or `exclude` by providing an array of Regexes to match URL against.

##Logging

The $log provider is augmented to access the file system when rendered on the server. It becomes then possible to log anything your web-app does on the server file system.

#Usage

##Client Side library

You can install it via bower with : 

```
bower install angular.js-server
```

For those without bower, this is where the file is https://github.com/a-lucas/angular.js-server-bower/tree/master/dest

Then you need to include the module `server` as a dependency in your AngularJS application.


##Server module installation

```
npm install angular.js-server
```

##Config object

This is an example of what a config object looks like:
 
```

var path = require('path');

module.exports = {
    name: "myApp",
    server: {
        domain: 'server.example',
        port: 3000,
        timeout: 15000
    },
    log: {
        log: {
            path: '/var/log/ng-server/log.log',
            stack: false
        },
        info: {
            path: '/var/log/ng-server/info.log',
            stack: false
        },
        warn: {
             path: '/var/log/ng-server/warn.log',
             stack: false
        },
        error: {
             path: '/var/log/ng-server/error.log',
             stack: true
        },
        debug: {
             path: '/var/log/ng-server/debug.log',
             stack: true
        }
    },
    cache: {
        storageConfig: {
            type: 'file', // possible values: none, file
            dir: path.resolve( __dirname + './../cache'),
        },
        cacheRules: {
            cacheMaxAge: [{
                regex: /.*/,
                maxAge: 10
            }],
            cacheAlways: [],
            cacheNever: [],
            default: 'never'
        }
    },
    render: {
        strategy: 'include',  // possible values: include, exclude
        rules: [
            /.*/ //pre-render it all !
        ]
    }
};

```


The `storageConfig` and the `cacheRules` config obey the definition of `simple-url-cache` found here: https://www.npmjs.com/package/simple-url-cache.

It means that you can also store the cached file inside a Redis datastore.

###server

`domain` is the tld.
`port` must be set, even if 80.
`timeout` is the number in seconds before the server consider the request timed out. If it is reached, the current (and possibly incomplete) rendered HTML will be sent to the client.

###log

Each logging options has the following set of parameters: 

`path` : the absolute log file path
`stack` : Want to see the stack trace? Set to true

###name:

This is the name of the AngularJS application present in the `ng-app` tag.

## Manually pre-render
 
 This assume that your angular app has loaded the client side module `server`.

```
var AngularServer = require('angular.js-server');

var renderer = new AngularServer(config);

var renderedPromise = renderer.render(html, url);

renderedPromise.then(function(html) {
    
}).catch(function(errorHtml) {

});

// renderedPromise is an ES6 promise

```


## Middleware

 This assume that your angular app has loaded the client side module `server`.

```
var AngularServer = require('angular.js-server');

var renderer = new AngularServer(config);

app.get('/*', renderer.middleware, function(req, res, next) {
   //your code here 
});

// or

app.use(renderer.middleware);

```

## Jade

 This assume that your angular app has loaded the client side module `server`.

```
var jadeHtml = jade.renderFile('./views/index-classic.jade', {});

var renderedPromise = angularServer.render(jadeHtml, req.url);

renderedPromise.then(function(result) {
    res.send(result);
}).catch(function(err) {
    res.send(err);
});
```

## Swig


 This assume that your angular app has loaded the client side module `server`.

```
var tpl = swig.compileFile('./views/index-classic.html', {
    cache: false
});

var prehtml = tpl({swigVarName: value});

var html = angularServer.render(prehtml, req.url);

html.then(function(result) {
    res.send(result);
}).catch(function(err) {
    res.send(err);
});
```


#API

##Constructor

`var renderer = new AngularServer(config)` 

##Methods

`middleware` is the `function(req, res, next)` used for http middleware injection. 

`render(html, url)` takes two strings as parameters, and returns an ES6 promise.


#Contributing

```bash
npm install
npm run bower
npm run typings
npm run build-client
npm run build
npm run test
```

For more debugging information, you can 

```bash
DEBUG=mocha-test-server,mocha-test,angular.js-server mocha
```


#WIP

This work is incomplete and totally in progress - DON'T use it on prod.