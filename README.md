#AngularJS

##Introduction
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
- Written in typescript and ES6

##Cons

- This is a new concept built on a rather old technology. Angular 1 is now 4 years old, and AngularJS2 will have server side rendering built-in - but at this time of writting, ng2 is still in rc.
- This is not unit tested (yet).
- It is quite hard to debug Angular Errors when these happens on the server side.
- There are many server side functionalities and performance optimisations missing . To cite a few: 
    - Benchmark are missing
    - Logging is missing
    - URL rewritting support
    - `ui-router` & `ng-router` integration are missing. For example, it would be better to configure the pre-render config inside these two routers as well as URL rewriting
    - Redis caching
    - URL cache invalidation library: for ex: `onUserUpdate: function(id) { cache.invalidate([ /user/([0-9+])/]); } `

    
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

So far, it only supports file caching, but modyfing the source code to use Redis instead is straigh forward.

Caching is made trough URL Regex, and supports severall mode ( `never`, `always`, and `maxAge` ).

##$http caching

When rendering the HTML on the server, every templateRequest and REST call are cached and injected into the client before the angular app runs. 
Then all the requests are instantly replayed, decreasing considerably the client page loading time.

##URL filtering

You can decide which URLs will be pre-rendered, and uses either of the two strategies `include` or `exclude` by providing an array of Regexes to match URL against.

##Logging

Not implemented

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
    cache: {
        type: 'file', // possible values: none, file
        fileDir: path.resolve( __dirname + './../cache'),
        cacheMaxAge: [{
            regex: /.*/,
            maxAge: 10
        }],
        cacheAlways: [],
        cacheNever: [],
        cacheTimestamp: []
    },
    render: {
        strategy: 'include',  // possible values: include, exclude
        rules: [
            /.*/, //pre-render it all !
        ]
    }
};

```

###server

`domain` is the tld.
`port` must be set, even if 80.
`timeout` is the number in seconds before the server consider the request timed out. If it is reached, the current (and possibly incomplete) rendered HTML will be sent to the client.

###cache

This is  a very basic cache engine that takes 4 types of caches

*cacheMaxAge* is an array of objects of type:
```
{
    regex: regular Expression
    maxAge: integer (Seconds)
}
```

*cacheAlways* and cache Never are array of js objects
```
{
    regex: regular Expression
}
```

*cacheTimestamp*: To be implemented

###name:

This is the name of the angularJS application present in the `ng-app` tag.

## Manually pre-render
 
 This assume that your angular app has loaded the client side module `server`.

```
var AngularServer = require('angular.js-server');

var renderer = new AngularServer(config);

var renderedPromise = renderer.render(html, url);

renderedPromise.then(function(html) {
    
}).fail(function(errorHtml) {

});

// renderedPromise is a Q promise

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
}).fail(function(err) {
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
}).fail(function(err) {
    res.send(err);
});
```


#API

##Constructor

`var renderer = new AngularServer(config)` throws an error if the config object is invalid using `jsonschema` https://github.com/tdegrunt/jsonschema

##Methods

`middleware` is the function(req, res, next) used for middleware injection. 

`render(html, url)` takes two strings as parameters, and returns a Q promise (https://github.com/kriskowal/q) .

#Examples

They are located in test. To run them, you must edit your /etc/hosts file
and add the following lines:

```
127.0.0.1   noserver.example    // render the app witouth server rendering
127.0.0.1   server.example      // render the app with server rendering and caching (if enabled)
127.0.0.1   api.example         // the api url
```

All the client code is written in ES6.

```
cd tests/server
DEBUG=angular.js-server node test-app.js
```

#WIP

This work is incomplete and totally in progress - DON'T use it on prod.

#Contributing

```
npm install
npm install -g webpack  
npm install -g typescript
npm install -g tsd
npm link webpack
tsd install
tsc
cd server/client ; webpack
```
