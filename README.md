# Angular.JS-server  [![Build Status](https://travis-ci.org/a-lucas/angular.js-server.svg?branch=master)](https://travis-ci.org/a-lucas/angular.js-server)

## Introduction

<!--Official site: https://a-lucas.github.io/angular.js-server/-->

[Angular.js](https://angularjs.org/ "A super hero framework")  is a super heroic framework originally designed for web apps development. It usage has quickly expanded for hybrid mobile application development, with one mojo: one language to rule it all.
  
The only missing piece is server-side rendering, which this package aims to fix. 

What does server side rendering means for angular?


- You don't have to modify your existing Angular.js code base.
- You can have big SEO benefits
- Your website will behave as a web application - which means a much richer UX.
- You get huge performances benefits by server side caching REST API and templateCache and replay them in your client instantly on page load
- You can start developiing your website with Angular, server side render it, and later port it into a mobile app with [cordova]()

<!--
[//]: # ##Comparing server prerendering with no prerendering

[//]: # ![MEAN.js HTML with Angular.js](screenshots/no-prerender.png)
[//]: # **MEAN.js HTML with Angular.js**

[//]: # ![MEAN.js HTML with Angular.js-server](screenshots/prerender.png)
[//]: # **MEAN.js HTML with Angular.js-server**

[//]: # You can check this out by yourself at this url: https://github.com/a-lucas/mean
-->
## How does it works?

This library uses [JSDOM]() to execute the angular app in a browser likre environment on the server, [simple-url-cache]() to handle the url caching and [angular.js-server client library]() to link this all together.

To explain what is going on under the hood, let's use a todo case scenario and compare it with angular-server's flow.

## Usual flow

1. The  browser request `/Todo`
2. The server receives the request and sends back the HTML ( which is almost empty )
3. The client receives the HTML, loads all the JS scripts and then bootstrap angular
4. Once bootstrapped ng-app sends a $http request back to the server to a todo list
5. The server sends back a json list. we'll call it  **json-time**
6. Then angular displays the todo list on screen

**At this stage, the HTML you have in the web inspector is what ng-server aims for.**
We'll call it **GoalHTML**.


## Angular.js-server's flow

1. The browser request `/Todo`
2. The server receives and ask : **Should `/Todo` be rendered ?**
    - *(yes)*
        - **Is Caching enabled?**
            - *(yes)*
                - **Is Todo already cached?**
                    - *(no)*
                        - -> pre-render on server the app and get **GoalHTML** ready to be sent
                        - -> cache the result for subsequent calls
                        - **Is REST caching enabled?**
                            - *(yes)*
                                - -> cache **json-time**  (including $templates)                                    
                    - *(yes)*
                        - -> Retrieve both **GoalHTML** and **json-time**
            - *(no)*
                - pre-render on server the app and get **GoalHTML** ready to be sent            
        - Sends back **GoalHTML** + **json-time** embeded for an instant replay on the client
    - *(no)*
        - -> Return the vanilla HTML.

>> Note: All logging and error handling have been skipped for padding purposes

## Getting started

Choose what you want to pre-render and what you want to cache
    
    
    ```javascript
    vae ngServer = require('angular.js-server');
    var server = new ngServer();
    //by default, rendering is off, and caching off
    server.config.render.setDefault('include'); //never, include, exclude
    server.config.render.addRule(/^index\.html$/);
    
    app.get('/index.html', function(req, res) {
        var html = fs.readFileSYnc(..., 'utf-8');
        server.render(html, req.url).then(function(response){
            res.send(response.html);
        }, function(result) {
            // if any error, send the original html
            res.send(response.html);
        });
    }
    
    
    ```

## Config

The config options are quite extensive, you can get the complete api in the doc folder.

## Status string & error codes

- RENDERED: `0`
- RENDER_EXCLUDED: `1`
- ALREADY_CACHED: `2`
- SERVER_TIMEOUT: `3`
- ERROR_HANDLER: `4`
- SERVER_ERROR: `5`



## Dependencies

This library depends on a compatible version of [Angular.js-server client](https://github.com/a-lucas/angular.js-server-bower "Angular.js-server")

[![Build Status](https://travis-ci.org/a-lucas/angular.js-server-bower.svg?branch=master)](https://travis-ci.org/a-lucas/angular.js-server-bower)   [![codecov](https://codecov.io/gh/a-lucas/angular.js-server-bower/branch/master/graph/badge.svg)](https://codecov.io/gh/a-lucas/angular.js-server-bower)

    
## Requirements

**html5mode**

Your angular app must use [html5mode](). The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

**Angular.js 1.5.x**

This has been written with 1.5.x in mind.

**node.js**

The only known way to integrate node with popular server side technologies as (PHP, Perl, ASP, whatever) is to summon node.js child processes to do the work. 

## Functionalities

**Web page caching**

It is possible to cache the files on the file system, or in a [Redis]() datastore. If you need to use another storage engine, it is easy to extend [simple-url-cache]() package to meet your needs.

**REST $http caching & angular template pre-caching**

When pre-rendered, every templateRequest and REST call can be optionally cached and injected into the client before the angular app bootstraps. These requests are instantly replayed, decreasing considerably the client page loading time.

**URL filtering**

You can decide which URLs will be pre-rendered, and uses either of the two strategies `include` or `exclude` by providing an array of Regexes to match URL against.

**Logging** 

The $log provider is augmented to access the file system when rendered on the server. It becomes then possible to log anything your web-app does on the server file system.


## Installation

### Client Side library

You can install [it]() vith bower. 

```
bower install angular.js-server
```

For those without bower, this is [where the file is](https://github.com/a-lucas/angular.js-server-bower/tree/master/dist)

Then you need to include the module `server` as a dependency in your AngularJS application.

### Server module installation

```
npm install angular.js-server
```

#WIP

This work is incomplete and totally in progress - DON'T use it on prod withouth prior testing.