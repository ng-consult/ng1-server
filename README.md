# Angular.JS-server  

<!--[![Build Status](https://travis-ci.org/a-lucas/angular.js-server.svg?branch=master)](https://travis-ci.org/a-lucas/angular.js-server)-->

## Introduction

<!--Official site: https://a-lucas.github.io/angular.js-server/-->

[Angular.js](https://angularjs.org/ "A super hero framework")  is a super heroic framework originally designed for web apps development. It usage has quickly expanded for hybrid mobile application development, with one mojo: one language to rule it all.
  
The only missing piece is server-side rendering, which this package aims to fix. 

What does server side rendering means for angular?

- You don't have to modify your existing Angular.js code base.
- You can have big SEO benefits
- You get support for REST caching out of the box
- You get Support for REST pre-loading on page load out of the box
- Your website will behave as a web application - which means a much richer UX.
- You get huge performances benefits by server side caching REST API and templateCache and replay them in your client instantly on page load
- You can start developing your website with Angular, server side render it, and later port it into a mobile app with [cordova]()

<!--
[//]: # ##Comparing server prerendering with no prerendering

[//]: # ![MEAN.js HTML with Angular.js](screenshots/no-prerender.png)
[//]: # **MEAN.js HTML with Angular.js**

[//]: # ![MEAN.js HTML with Angular.js-server](screenshots/prerender.png)
[//]: # **MEAN.js HTML with Angular.js-server**

[//]: # You can check this out by yourself at this url: https://github.com/a-lucas/mean
-->
## How does it works?


It is composed by 4 main components, 

1. **The Client library**
    By design, can be platform independent, language independent. This is a simple websocket client that queries the render for an url or an url+html. It gets notified in Real time by **(2)** about the status of the query.
2. **The Bridge**
    The Bridge has two socket servers listening on two different ports. First port is dedicated for external communications with the client **(1)**. The second port is dedicated to internal communications with **(4)**.
    Bridge reponsabilties are : 
    - Listen for **(1)**, and update **(1)** in real time as soon someting new happens( queues, starting, finished, error)
    - Manage the internal pool of 1's requests
    - Spawn processes launching a [slimer.js]() instance rendering the URL/HTML (1) ask for.
    - Once the webapp launches inside slimer, listen socket requests from **(4)** about logging and application state (`error` | `idle`)        

3. **A Cache Web Server.**
    The cache server is a custom proxy that will cache urls depending on regex rules you specify in the config file `slimerRestCacheRules.js`
    The same cache server is used both by 
    - Slimer.js to request external scripts (for example, Angular.js's cdn, you might want to cache it to accelerate the page rendering speed server side)
    - The Webapp client module to fetch $http REST queries and templates.
    
4. **NgServer client module**
    This library modifies severall providers : `$cacheFactory`, `$q`, `$log` and connects to **(2)**'s socket server.
    Once `IDLE`, it then export the `$cacheFactory`'s content that has been cached server side to **(2)** alongside with the page's rendered HTML.
     
This library uses 
- [Slimer.JS]() to execute the angular app in a browser like environment on the server, 
- [simple-url-cache](https://www.npmjs.com/package/simple-url-cache) to handle the url caching and 
- [angular.js-server client library](https://github.com/a-lucas/angular.js-server-bower) to link this all together.

<!--
To explain what is going on under the hood, let's use a todo case scenario and compare it with angular-server's flow.

## Usual flow

1. The  browser request `/Todo`
2. The server receives the request and sends back the HTML ( which doesnt't have much body, the ng-app loads it asynchronously )
3. The client receives the HTML, loads all the JS scripts and then bootstrap angular, resolving the route and $http'ing all the needed templates 
4. Once bootstrapped ng-app sends a $http request back to the server for a todo list
5. The server sends back a json list.we'll call it  **json-time**, and all the html templates, which we call **templates[]**
6. Then angular displays the todo list on screen

*At this stage, the HTML you have in the web inspector is what ng-server aims for.*
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
                        - -> cache the **GoalHTML** for subsequent calls
                        - **Is REST caching enabled?**
                            - *(yes)*
                                - -> cache **json-time**
                                - -> cache **templates[]**                                    
                    - *(yes)*
                        - -> Retrieve **GoalHTML** , **json-time** and **templates[]**
            - *(no)*
                - pre-render on server the app and get **GoalHTML** ready to be sent            
        - Sends back **GoalHTML** + **json-time** + **templates[]** embeded for an instant replay on the client
    - *(no)*
        - -> Return the vanilla HTML.

>> Note: All logging and error handling have been skipped for padding purposes
-->
## Getting started

### WARNING

#### This only works on my local machine, due to external beta packages not published on NPM. Be patient. Also test are not there, so really not ready, but getting there.

### Installation

```bash
# Needs firefox engine
sudo apt-get install firefox

# classic scripts
npm i
npm run install
```


### Starting the server

This is a work in progress, later, this will be packaged into a `.deb` file, and the config folder will be static.

You need to get node installed and a `REDIS` server available.

First, you will need to modify the files in `REPOSITORY_PATH/bin/configSample`. and edit your redis connection infos.

Then 

```bash
#Terminal 1
cd REPOSITORY_PATH/bin 
chmod +x *
DEBUG=ngServer* ./master.js REPOSITORY_PATH/bin/configSample
```

By Default, ngServer listen on port **8881**. 

To check if this works, you can run inside these commands: 

```bash
#Terminal 2
cd test-server/server
DEBUG=test-server,ngServer* node test-app.js

#Terminal 3
cd bin
./aaa.js
```

### Integrating with your app: 


**Dependencies**

This library depends on a compatible version of [Angular.js-server client](https://github.com/a-lucas/angular.js-server-bower "Angular.js-server")

Just add the `server` module as a dependency.

**Requirements**

***html5mode***

Your angular app must use [html5mode](). The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

***Angular.js 1.5.x***

This has been written with 1.5.x in mind.

### Running the client
 
The client connects to the ngServer port specified in the config.

```
var Client = require('ngServerClient`);

var client = new Client('http://127.0.0.1:8881');

client.renderHTML(url, function( response ) {
    
});


client.renderHTML(url, html, function( response ) {
    
});

```

**Response's structure:** 

```
{
  status: number,
  html?: string  
}

```

**Status codes:** 

- **1** : This URL should never be pre-rendered as defined in the `configDir/serverRenderRules.js`
- **2** : This URL has been pre-rendered correctly, the `response.html` property contains the result.
- **4** : Some error happens, html has not been preprendered, `response.html` is not set.


##Logging


### File logging
ngServer uses Bunyan to log usefull informations and any errors raised.

The following log files are created, depending on the value of `serverConfig.logBasePath`: 

```bash

cd $logBasePath
ls

# Server logs
trace.log
info.log
error.log

# Web application logs triggered with angular's $log
web-app.log
web-app-errors.log

```


### GrayLog 
 
 You can forward all these logs to a GrayLog server by changing the config `serverConfig.gelf`. Note that the input must be UDP. 
 

<!---
## Config

Angular-server has severall config options :
 
- **ServerConfig**
    Sets the domain name, port, base url, timeout and debug
- **RenderConfig**
    Add and remove Regex rules, and set up the render strategy to adopt. 
- **LogConfig**
    All your client log is written on the server, here you setup the base dir, server log, and fine tune each of [warn, info, log, debug and error]'s behavior. 
- **CacheConfig** and **RestCacheConfig**
    They both share the same class definition. Add/Get/Remove caching rules, clear cache. 

> All these config objects are passed by reference and are public. 

## Config API

Check the `docs` folder.

## Dependencies

This library depends on a compatible version of [Angular.js-server client](https://github.com/a-lucas/angular.js-server-bower "Angular.js-server")

[![Build Status](https://travis-ci.org/a-lucas/angular.js-server-bower.svg?branch=master)](https://travis-ci.org/a-lucas/angular.js-server-bower)   [![codecov](https://codecov.io/gh/a-lucas/angular.js-server-bower/branch/master/graph/badge.svg)](https://codecov.io/gh/a-lucas/angular.js-server-bower)

## Requirements

**html5mode**

Your angular app must use [html5mode](). The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

**Angular.js 1.5.x**

This has been written with 1.5.x in mind.

**node.js**



## Functionalities

**REST $http caching & angular template pre-caching**

When pre-rendered, every templateRequest and REST call can be optionally cached and injected into the client before the angular app bootstraps. These requests are instantly replayed, decreasing considerably the client page loading time.
REST and template caching is shared between angular instances.

**URL filtering**

You can decide which URLs will be pre-rendered, and uses either of the two strategies `include` or `exclude` by providing an array of Regexes to match URL against.

**Logging** 


## Installation

### Client Side library

You can install [it](https://github.com/a-lucas/angular.js-server-bower) vith bower. 

```bash
bower install angular.js-server
```

For those without bower, this is [where the file is](https://github.com/a-lucas/angular.js-server-bower/tree/master/dist)

Then you need to include the module `server` as a dependency in your AngularJS application.

### Server module installation

```bash
npm install angular.js-server
```
-->
#WIP

This work is incomplete and in progress - DON'T use it on prod withouth prior testing.