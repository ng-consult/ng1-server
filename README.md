# ng1-server  

[![Build Status](https://travis-ci.org/ng-consult/ng1-server.svg?branch=master)](https://travis-ci.org/ng-consult/ng1-server)  [![codecov](https://codecov.io/gh/ng-consult/ng1-server/branch/master/graph/badge.svg)](https://codecov.io/gh/ng-consult/ng1-server)

## Introduction

<!--Official site: https://a-lucas.github.io/angular.js-server/-->

> This is a server side rendering  for Angular 1. For Angular2+, you may look at [Angular universal](https://universal.angular.io/)

> A port of this server to Angular2 is not on the roadmap - but it is technically possible to adapt ng1-server-bower for angular2+.

[Angular.js](https://angularjs.org/ "A super hero framework") is a super heroic framework originally designed for web apps development. It usage has quickly expanded for hybrid mobile application development, with one mojo: one language to rule it all.
  
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
[//]: # ##Comparing server pre-rendering with no pre-rendering

[//]: # ![MEAN.js HTML with Angular.js](screenshots/no-prerender.png)
[//]: # **MEAN.js HTML with Angular.js**

[//]: # ![MEAN.js HTML with Angular.js-server](screenshots/prerender.png)
[//]: # **MEAN.js HTML with Angular.js-server**

[//]: # You can check this out by yourself at this url: https://github.com/a-lucas/mean
-->
## How does it works?

It is composed by 5 main components, 

###The Client

By design, it can be platform independent, language independent. This is a simple websocket client that queries the rendering server (Bridge) for an url or an url+html. 
It gets notified in real time by **the bridge** about the status of the query.

###The Bridge

The Bridge has two socket servers listening on two different ports. First port is dedicated for external communications with the **client**. 
The second port is dedicated to internal communications with **the Angular client module (ng1-server-bower)**.

- Listen and updates the **the client** in real time as soon something new happens( queues, starting, finished, error).
- Spawns and manage the internal pool of **slimer.js instances**.
- Once the web-app launches inside slimer, listen socket requests from **the ng1-server client module** about logging and application state (`error` | `idle`)        

###The slimer.JS instances

Each pre-rendering is made via slimer.js which is similar to phantom.js. It simulates a real web-browser environment, and execute the URL/HTML.

- Communicates with it parent's process trough websocket, sending runtimes error informations
- Intercept every network communication ( `<script>` loading, '$http' calls, and forward them to the **cache  web server**.
- Makes sure no zombie are left behind
- Handles runtimes error

###The ng1-Server-bower client module

This module is included inside the angualr web-app and modifies several providers to adapt with the server side environment.

*When running on server:*

- Forwards all $log calls to **the bridge**
- When detecting the IDLE event, it sends the rendered HTML to the **bridge** AND exports the `$cacheFactory`'s content to **the bridge**
    
*When running on the client's browser:*

- Replays the `$cacheFactory` content for faser client side rendering
- If enabled, forward all `$http` calls to the **cache web server**
    
###A Cache Web Server

The cache server is a custom proxy/cdn that will cache urls depending on regex rules you specify in the config file `slimerRestCacheRules.yaml`
It is used by **the slimmer.js instances** and **the ng1-server-bower angualr module**

         
## Beta

This is a beta, and it is still WIP.
What need to be done before reaching stable release is : 


- All cases for e2e testing have to be implemented [Documented here](test/README.md)
- Packaging the server into `.deb`, `.rpm`, `mac os` and windows `.exe` binaries ( possible with [nexe](https://github.com/nexe) ) 

## Test

Testing methodology is [documented here](test/README.md)

Simply run `npm run test` or [check the travis output](https://travis-ci.org/ng-consult/ng1-server)

## Main dependencies

This library uses 

- [Bunyan](https://github.com/trentm/node-bunyan) to log server related metrics and web app behavior. It also integrtes with [Graylog](https://www.graylog.org/)
- [Slimer.JS](https://slimerjs.org/) to execute the angular app in a browser like environment on the server, 
- [redis-url-cache](https://www.npmjs.com/package/redis-url-cache) to handle the url caching and 
- [ng1-server client library](https://github.com/ng-consult/ng1-server-bower) to link this all together.
- [socket-io](http://socket.io/) to establish communication between the application modules. 

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

## ng1-server's flow

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

First, you will need to modify the files in `REPOSITORY_PATH/bin/configYaml`. and edit your redis connection info.

Then 

```bash
#Terminal 1
cd REPOSITORY_PATH/test-server/server 
DEBUG=test-server,ngServer* node test-app.js
```

By Default, ngServer listen on port **8881, 8882 and 8883**. 

To check if this works, you can run this: 

```bash
#Terminal 2
cd bin
./client.js
```


### Integrating with your app: 


**Dependencies**

This library depends on a compatible version of [ng1-server client](https://github.com/ng-consult/ng1-server-bower "ng1-server")

Just add the `server` module as a dependency.

**Requirements**

***html5mode***

Your angular app must use [html5mode](https://docs.angularjs.org/guide/$location). The reason behind this requirement is that browsers don't send the hashbang fragment to the server.

***Angular.js 1.5.x***

This has been written with 1.5.x in mind - but it should work with 1.3+ .

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

# Configuration

## Client configuration

You shouldn't have to change a line of code into your angular.js existing web-app.

*install ng1-server-bower*

```bash

bower install ng1-server
```


Then include the `server` module into your web-app.

```javascript
angular.module('your-app',['server']);
```


You will then have to define a global `serverConfig` variable for the client app.

```javascript

var serverConfig = {
    clientTimeoutValue: number,
    debug: boolean,
    httpCache: boolean,
    restCache: boolean,    
    restServerURL: string
}

```

**clientTimeoutValue** *default = 200*
 
You shouldn't have to change/set this setting. It is used by the client to triggerthe IDLE status of the app. Once a potential IDLE status is detetcetd, it will check again in 200ms if the app status has changed since then. If no, then this is an IDLE.

**debug** *default = false*

Turns the `$log.dev` on the client. 

**httpCache** *default = false*

After the client replays all the $http calls, set $http.cache to this value.

**restCacheEnabled** *default = false*

Enables the REST caching functionality. Every subsequent $http call will be going trough the `restServerURL`. 
 
**restServerURL** *default = null*

If `restCacheEnabled`, this setting is required. The restServerURL will proxy all $http request, and will cache them according to the `slimerRestCacheRules.yml` rules.


## Server configuration

###serverConfig.yml

```yaml
domain: 'http://localhost:3000'
timeout: 10
logBasePath: '/logs'
gelf:
 enabled: true
 host: '127.0.0.1'
 port: 12203
socketServers:
 bridge_external:
   protocol: 'http://'
   host: '127.0.0.1'
   port: 8881
 bridge_internal:
   protocol: 'http://'
   host: '127.0.0.1'
   port: 8882
 proxy:
   protocol: 'http://'
   host: '127.0.0.1'
   port: 8883
redisConfig:
 host: '127.0.0.1'
 port: 6379
 socket_keepalive: true

```

**domain** 

Your webapp domain name (including the port)

**timeout**

Number in seconds after the server rendering will be considered as timed out.

**logbasePath**

Path where all server side log file will be stored. It will attempt to create them under `/` first. If failed, it will use the relative path from where the server is launched.

**gelf**

Turns Graylog supports on.

**socketServers**

Defines all server addresses

**redisConfig**

Information about your redis server.


###serverRenderRules.yml

Tells the server which URL it should pre-render. Those not pre-rendered will return the original HTML.

`strategy` is `always` or `never`
`rules[]` contains a list of Regexes. If strategy is always, then every URL matching this list will be pre-rendered. Otherwise they will be ignored. 

Example 1: pre-render every URLs.

```yaml
strategy: 'always'
rules: []
```

Example 2: pre-render only URLS ending with `.html`.

```yaml
strategy: 'always'
rules: 
    - /.*\.html$/   
```


Example 3: pre-render everything execpt URLS containing `user`.

```yaml
strategy: 'never'
rules: 
    - /user/   
```


###serverCacheRules.yml 

Now the URL is pre-rendered, should the server cache this HTML for next time?

###slimerRestCacheRules.yml

Configures what dependencies / REST url will be cached.

ex1: Scripts dependencies, want to cache all calls to angular-ui ? angular-material? your sources? This is recommended because this will greatly improves the pre-rendering speed.

ex2: Some $http rest calls are known to be static? Some other changes once in a while? You can cache them too !

Both `serverCacheRules.yml` and `slimerRestCacheRules.yml` files format specification follows [redis-url-cache config file format](https://ng-consult.github.io/redis-url-cache/api.html#config.cache-rules).


#WIP

This work is incomplete and in progress - DON'T use it on prod withouth prior testing.