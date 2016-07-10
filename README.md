# Requirements

1- Your angular app must use html5mode. The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

So for example, rendering on the server side http://domain.com/url#blah will just render http://domain.com/url.

2- You must use a modified version of AngularJS ( while I get the time to write the tests to contribute to Angular source code. )


# Config object

```
var path = require('path');

module.exports = {
    name: "myApp",
    path: {
        log: path.resolve( __dirname + '/logs'),
        pid: path.resolve( __dirname + '/pids')
    },
    server: {
        domain: 'server.example',
        port: 3000,
        timeout: 15000,
        jsFiles: [
            path.resolve( __dirname + './../build-angular-engine/angular.js'),
            path.resolve( __dirname + './../build-angular-engine/angular-resource.js'),
            path.resolve( __dirname + './../build-angular-engine/angular-route.js'),
            path.resolve( __dirname + './../dist/client/app.js')
        ]
    },
    cache: {
        type: 'file',
        fileDir: path.resolve( __dirname + '/cache'),
        cacheMaxAge: [{
            regex: /.*/,
            maxAge: 120
        }],
        cacheAlways: [],
        cacheNever: [],
        cacheTimestamp: []
    }
};
```
## server

`jsFiles` must encapsulate all the JS files necessary for running your angular App.
`timeout` is the number in seconds before the server consider the request timedout. If it is reached, the current (and possibly incomplete) rendered HTML will be sent to the client.

## cache

This is  a very basic cache engine that takes 4 types of caches

cacheMaxAge is an array of objects of type:
{
    regex: reguar Expression
    maxAge: integer (Seconds)
}

cacheAlways and cache Never are array of js objects

{
    regex: reguar Expression
}

cacheTimestamp:
TODO To be implemented

## name:

This is the name of the angularJS application present in the ng-app tag.

## restriction

It is better if your API server is using a different url than the static server page, or if each URL in each $http calls include the domain name instead of relative URL.


# Usage:

1- make sure the folders for views, external scripts, as well as the custom build-angular are accessible.

appServer.use('/views', express.static( path.resolve(__dirname + '/../../../src/views')));
appServer.use('/dist', express.static( path.resolve(__dirname + '/../../../dist/client')));

2-Jade:

Put your Angular code into a .jade file, and then, pre-render it with AngularSever

 //Get Jade to pre-render
 var jadeAngularHtml = jade.renderFile('./views/angular.jade', {});

 //Call to Angular Server wth cache support
 var html = angularServer.render(jadeAngularHtml, req.url);

 html.then(function(result) {
    res.render('index-pre-render', { angularServerHtml: result });
 }).fail(function(err) {
    res.render('index-pre-render', { angularServerHtml: err });
 });

#TODO

This work is incomplete. I published it to npm so I can start testig it on well known AngularJS projects.

- CacheTimestamp
- Logging
- Better Exception support
- $http caching (replay all $http made on the server into the client to speed up client load)
- Testing

# Examples

They are located in test. To run them, you must edit your /etc/hosts file
ad add the following lines:

127.0.0.1   noserver.example    // render the app witouth server rendering
127.0.0.1   server.example      // render the app with server rendering and caching (if enabled)
127.0.0.1   api.example         // the api url


All the client code is written in ES6.



