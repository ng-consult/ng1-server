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
- You don't have to change your existing code base to make an existing AngularJS app work.
- Your website, once the page loaded, will behave as a web application - which means a much richer user experience

##Cons

- This is a new concept built on a rather old technology. Angular 1 is now 4 years old, and AngularJS2 will have server side rendering built-in - but at this time of writting, ng2 is still in rc.
- This is not unit tested (yet).
- It is quite hard to debug Angular Errors when these hapens on the server side.
- There are many server side functionalities and performance optimisations missing . To cite a few: 
    - $http caching ( to  speed up the page load when the browser loads a pre-rendered html page)
    - Benchmark are missing
    - Logging is missing
    - URL rewritting
    - `ui-router` & `ng-router` integration are missing. For example, it would be better to configure the pre-render config inside these two routers as well as URL rewriting
    - Redis caching
    - URL cache invalidation library: for ex: `onUserUpdate: function(id) { cache.invalidate([ /user/([0-9+])/]); } `
    - and much more
    
# Requirements

##html5mode

Your angular app must use html5mode. The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

So for example, rendering on the server side http://domain.com/url#blah will just render http://domain.com/url.

##Custom build of Angular

You must use a modified version of AngularJS ( while I get the time to write the tests to contribute to Angular source code. )

So far the only version of angular available is `1.5.7`, available here: https://github.com/a-lucas/bower-angular/tree/v1.5.7

*Why do I need a custom build of Angular?*

In order to have the prerenderer working, I need to make sure that all the initial templates are loaded, and all the REST api calls are completed.
In short, I have to make sure that the Angular application is in IDLE state. And Angular1 doesn't trigger (yet) this idle state event.

 You can check how this is done at this URL: https://github.com/a-lucas/angular.js
 
 All tests passes, but the $EngineQueueProvider hasn't been tested.


#Functionalities


##Caching

So far, it only supports file caching, but modyfing the source code to use Redis instead is straigh forward.

Caching is made trough URL Regex, and supports two caching mode ( `never`, `always`, and `maxAge` ).

##URL filtering

You can decide which URLs will be pre-rendered, and uses either of the two strategies `include` or `exclude` by providing an array of Regexes to match URL against.

##Logging

Not implemented (yet)

#How to use

##install

```
npm install angular.js-server
```

##Config object

```

var path = require('path');

module.exports = {
    name: "myApp",
    log: path.resolve( __dirname + './../logs'),
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

```timeout``` is the number in seconds before the server consider the request timed out. If it is reached, the current (and possibly incomplete) rendered HTML will be sent to the client.

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

cacheTimestamp:
TODO To be implemented

###name:

This is the name of the angularJS application present in the `ng-app` tag.

# Usage:

## Manually prerender
 

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
node test-app.js
```

#WIP

This work is incomplete and totally in progress - DON'T use it on prod.
