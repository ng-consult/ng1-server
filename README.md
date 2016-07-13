# Requirements

1- Your angular app must use html5mode. The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

So for example, rendering on the server side http://domain.com/url#blah will just render http://domain.com/url.

2- If you are using angular.bootstrap() to kickoff your angular app, add the following condition:

```
if (!window.onServer) {
 angular.bootstrap(...)
}
```

3- You must use a modified version of AngularJS ( while I get the time to write the tests to contribute to Angular source code. )



# Config object

```
/**
 * Created by antoine on 07/07/16.
 */
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
        strategy: 'exclude',  // possible values: all, none, include, exclude
        rules: [
            /Error/,
            /Main/
        ] // Don't pre-render the two urls /Error and /Main
    }
};

```
## server

```timeout``` is the number in seconds before the server consider the request timedout. If it is reached, the current (and possibly incomplete) rendered HTML will be sent to the client.

## cache

This is  a very basic cache engine that takes 4 types of caches

cacheMaxAge is an array of objects of type:
```
{
    regex: regular Expression
    maxAge: integer (Seconds)
}
```

cacheAlways and cache Never are array of js objects
```
{
    regex: regular Expression
}
```
cacheTimestamp:
TODO To be implemented

## name:

This is the name of the angularJS application present in the `ng-app` tag.

# Usage:

1- make sure the folders for views, external scripts, as well as the custom build-angular are accessible.
```
appServer.use('/views', express.static( path.resolve(__dirname + '/../../../src/views')));
appServer.use('/dist', express.static( path.resolve(__dirname + '/../../../dist/client')));
```

2- Generate the HTML


```
var AngularServer = require('angular.js-server');

var renderer = new AngularServer(config);

var renderedHtml = renderer.rende(html, url);
```

3-Jade & Swig examples


They are located in test. To run them, you must edit your /etc/hosts file
ad add the following lines:
```
127.0.0.1   noserver.example    // render the app witouth server rendering
127.0.0.1   server.example      // render the app with server rendering and caching (if enabled)
127.0.0.1   api.example         // the api url
```

All the client code is written in ES6.


#WIP

This work is incomplete and totally in progress - DON'T use it on prod.

#MEAN.js

A hacky working version with server side rendering is at this url: https://github.com/a-lucas/mean

Because this package hasn't been published to npm (yet), to make it work, just do like this:

```
mkdir ng-server
cd ng-server
git clone https://github.com/a-lucas/mean
git clone https://github.com/a-lucas/angular.js-server
cd angular.js-server ; npm install
cd ../mean ; npm install ; bower install
grunt
```

# Current main issue :

Crashes when loading minified version of angular



