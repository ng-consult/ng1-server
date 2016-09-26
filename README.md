#Angular.JS-server  [![Build Status](https://travis-ci.org/a-lucas/angular.js-server.svg?branch=master)](https://travis-ci.org/a-lucas/angular.js-server)

##Introduction

<!--Official site: https://a-lucas.github.io/angular.js-server/-->

[Angular.js](https://angularjs.org/ "A super hero framework")  is a super heroic framework originally designed for web apps development. It usage has quickly expanded for hybrid mobile application development, with one mojo: one language to rule it all.
  
The only missing piece is server-side rendering, which this package aims to fix. 

What does server side rendering means for angular?

- You can transform your website into a web app with [cordova]()
- You don't have to modify your existing Angular.js code base.
- Your website will behave as a web application - which means a much richer UX.
- You can server side cache REST API and templateCache and replay them in your client.

<!--
[//]: # ##Comparing server prerendering with no prerendering

[//]: # ![MEAN.js HTML with Angular.js](screenshots/no-prerender.png)
[//]: # **MEAN.js HTML with Angular.js**

[//]: # ![MEAN.js HTML with Angular.js-server](screenshots/prerender.png)
[//]: # **MEAN.js HTML with Angular.js-server**

[//]: # You can check this out by yourself at this url: https://github.com/a-lucas/mean
-->


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

##Functionalities

**Web page caching**

It is possible to cache the files on the file system, or in a [Redis]() datastore. If you need to use another storage engine, it is easy to extend [simple-url-cache]() package to meet your needs.

**REST $http caching & angular template pre-caching**

When pre-rendered, every templateRequest and REST call can be optionally cached and injected into the client before the angular app bootstraps. These requests are instantly replayed, decreasing considerably the client page loading time.

**URL filtering**

You can decide which URLs will be pre-rendered, and uses either of the two strategies `include` or `exclude` by providing an array of Regexes to match URL against.

**Logging** 

The $log provider is augmented to access the file system when rendered on the server. It becomes then possible to log anything your web-app does on the server file system.


##Usage

###Client Side library

You can install [it]() vith bower. 

```
bower install angular.js-server
```

For those without bower, this is [where the file is](https://github.com/a-lucas/angular.js-server-bower/tree/master/dist)

Then you need to include the module `server` as a dependency in your AngularJS application.

###Server module installation

```
npm install angular.js-server
```
<!--
##API

- EngineConfig
    - properties
        - [cache](#cache)
        - [log](#log)
        - [render](#render)
        - [restCache](#restCache)
        - [server](#server)
    - methods
        - [constructor](#constructor)       
- CacheConfig
    - [defaultConfig]()
    - methods
        - [addAlwaysRule](addAlwaysRule]
        - [addMaxAgeRule](#addMaxAgeRule)
        - [addNeverRule](#addNeverRule)
        - [clearAllCachedUrl](#clearAllCachedUrl)
        - [clearCachedUrl](#clearCachedUrl)
        - [initialize](#initialize)
        - [importConfig](#importConfig)
        - [getAlwaysRules](#getAlwaysRules)
        - [getCacheEngine](#getCacheEngine)
        - [getDefault](#getDefault)
        - [getMaxAgeRules](#getMaxAgeRules)
        - [getNeverRules](#getNeverRules)
        - [setDefault](#setDefault)
        - [setStorageConfig](#setStorageConfig)
        - [removeAllAlwaysRules](#removeAllAlwaysRules)
        - [removeAllMaxAgeRules](#removeAllMaxAgeRules)
        - [removeAllNeverRules](#removeAllNeverRules)
        - [removeAllRules](#removeAllRules)
        - [removeAlwaysRule](#removeAlwaysRule)
        - [removeMaxAgeRule](#removeMaxAgeRule)
        - [removeNeverRule](#removeNeverRule)  
- LogConfig
    - [default config](#default config)
    - [methods](#methods)
        - [importConfig](#importConfig)
        - [getBasePath](#getBasePath)
        - [getConfig](#getConfig)
        - [getDefinition](#getDefinition)
        - [getFileServerName](#getFileServerName)
        - [getLogServerPath](#getLogServerPath)
        - [getLogPath](#getLogPath)       
        - [log](#log)
        - [setDefinition](#setDefinition)
        - [setBasePath](#setBasePath)
        - [setFileServerName](#setFileServerName)
- RenderConfig
    - [default config](#default config)
    - [methods](#methods)
        - [addRule](#addRule)
        - [getStrategy](#getStrategy)
        - [getRules](#getRules)
        - [hasRule](#hasRule)            
        - [importConfig](#importConfig)
        - [removeRule](#removeRule)
        - [setStrategy](#setStrategy)
        - [shouldRender](#shouldRender)
- ServerConfig
    - [default config](#default config)
    - [methods](#methods)
        - [importConfig](#importConfig)
        - [setBase](#setBase)
        - [setDebug](#setDebug)              
        - [setDomain](#setDomain)
        - [setPort](#setPort)
        - [setTimeout](#setTimeout)
        - [getBase](#getBase)                        
        - [getDebug](#getDebug)
        - [getDomain](#getDomain)
        - [getPort](#getPort)
        - [getTimeout](#getTimeout)        
- AngularServerRenderer
    - [properties](#properties)
        - [config](#config)
    - methods
        - [addExternalresource](#addExternalresource)
        - [constructor](#constructor)
        - [emptyExternalResources](#emptyExternalResources)
        - [getExternalResources](#getExternalResources)
        - [middleware](#middleware)
        - [render](#render)
- ResponseCodes



##EngineConfig
This object contains 5 public configuration objects.

###properties

####cache

**cache typeof [CacheConfig](#CacheConfig)**
####log

**log typeof [LogConfig](#LogConfig)**

####render

**render typeof [RenderConfig](#RenderConfig)**

####restCache

**restCache typeof [CacheConfig](#CacheConfig)**

####server

**server typeof [ServerConfig](#ServerConfig)**

Example: 

```javascript

const angularServer = new AngularServerRenderer();
const config = angularServer.config;

config.server.setDebug(true);
//...

```



##CacheConfig

###defaultConfig

###methods

#### addAlwaysRule

**addAlwaysRule( RegExp )**


URLs matching this RegExp will be cached indefinitively untill removed

####addMaxAgeRule

**addMaxAgeRule( RegExp, number)**


URLs matching this RegExp will have a ttl ( ms )

####addNeverRule

**addNeverRule( RegExp )**


URLs matching this RegExp will never be cached

####clearAllCachedUrl

**clearAllCachedUrl()**


Remove all cached URLs for either Redis or the FS.

####clearCachedUrl

**clearCachedUrl( RegExp )**


Remove all URLs matching this RegExp

####importConfig

**importConfig( CacheConfig )**


Set up the config from a json object, this JSON must match [simple-url-cache]() format.

####getCacheEngine

**getCacheEngine()**


Return a [simple-url-cache]() object which got the following methods, if you need to tweak your storage

Example: 

```javascript

const cacheEngine = server.config.cache.getCacheEngine();

let url = cacheEngine.url('/someURL.html');

url.isCached().then((isCached) => {
    debug('This is cached');
});

url.cache('Some Content').then(() => {
    url.removeUrl();
});

```

####getDefault

**getDefault**

Return the default caching strategy. The return value is either 'always' or 'never';


**getMaxAgeRules**



**getNeverRules**

**setDefault( string )**

Sets the default caching strategy, Either `always` or `never`. See above for an example.

If no URL match the rules, then this default strategy will be applied.

Example: 

```javascript

const as = new AngularServerRenderer();
const cache = as.config.cache;
cache.removeAllRules();
cache.setDefault('never');
// at this stage, nothing will be cached ever

```

**setStorageConfig( FileStorageConfig | RedisStorageConfig )**



**removeAllAlwaysRules()**


**removeAllMaxAgeRules()**

**removeAllNeverRules()**

**removeAllRules()**

**removeAlwaysRule( RegExp )**

**removeMaxAgeRule( RegExp )**

**removeNeverRule( RegExp )**
        
        
-->

###Constructor
---

```typescript
var renderer = new AngularServer(config)
``` 

###Methods
---


#### - middleware()

This is the `function(req, res, next)` used for [http]() and [express]() middleware injection. 



#### - render(html: string, url: string)


***Returns***  an [ES6 promise]() which will be resolved or rejected with a Response object:

```typescript
{
    html: string
    status: string
    code: number
    stack: string
}
```

###Status string & error codes
-----------------------------

- RENDERED: `0`
- RENDER_EXCLUDED: `1`
- ALREADY_CACHED: `2`
- SERVER_TIMEOUT: `3`
- ERROR_HANDLER: `4`
- SERVER_ERROR: `5`


###Examples

This assume that your angular app has loaded the client side module [server](https://github.com/a-lucas/angular.js-server-bower).

#### Manually pre-render
 

```
var AngularServer = require('angular.js-server');

var renderer = new AngularServer(config);

var renderedPromise = renderer.render(html, url);

renderedPromise.then(function(html) {
    
}).catch(function(errorHtml) {

});

// renderedPromise is an ES6 promise

```


####Middleware


```
var AngularServer = require('angular.js-server');

var renderer = new AngularServer(config);

app.get('/*', renderer.middleware, function(req, res, next) {
   //your code here 
});

// or

app.use(renderer.middleware);

```

#### Jade


```
var jadeHtml = jade.renderFile('./views/index-classic.jade', {});

var renderedPromise = angularServer.render(jadeHtml, req.url);

renderedPromise.then(function(result) {
    res.send(result);
}).catch(function(err) {
    res.send(err);
});
```

#### Swig


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



##Contributing

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



##Config 

This is an example of what a config object looks like:
 
```

var path = require('path');

module.exports = {
    name: "myApp",
    server: {
        domain: 'server.example',
        port: 3000,
        timeout: 15000,
        debug: false
    },
    log: {
        dir: '/var/log/angular.js-server', 
        log: {
            enabled: true,
            stack: false
        },
        info: {
            enabled: true,
            stack: false
        },
        warn: {
             enabled: true,
             stack: false
        },
        error: {
             enabled: true,
             stack: true
        },
        debug: {
             enabled: true,
             stack: true
        }
    },
    cache: {
        storageConfig: {
            type: 'file', // possible values: none, file, redis
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
    rest_cache: { 
        cacheMaxAge: [{
            regex: /.*/,
            maxAge: 10
        }],
        cacheAlways: [],
        cacheNever: [],
        default: 'never'
    },
    render: {
        strategy: 'include',  // possible values: include, exclude
        rules: [
            /.*/ //pre-render it all !
        ]
    }
};

```


The `storageConfig`, `cacheRules` and `rest_cache` must match [simple-url-cache](https://www.npmjs.com/package/simple-url-cache "Simple-url-cache ")'s config definition.

###server

`domain` is the tld.
`port` must be set, even if 80.
`timeout` is the number in seconds before the server consider the request timed out. If it is reached, the current (and possibly incomplete) rendered HTML will be sent to the client.
`debug` Will log some debugging informaions inside `dev.log`

###log

Each logging options has the following set of parameters: 

`enabled` : Talks for itself
`stack` : Want to see the stack tracetrace? Set to true


###name:

This is the name of the AngularJS application present in the `ng-app` tag.

###rest_cache

You can define which REST calls will be injected inside the response. 

It is a good idea to include all template views as well as most static content. 

For example, take a page that renders a blog content, but on the side, there is a weather widget that REST call the current forecast for the user's current location. You would be advised to exclude this REST url from getting cached, or some dude somewhere on the planet might get unexpectanly wet. 

Another critical example would be user personal informations.


#WIP

This work is incomplete and totally in progress - DON'T use it on prod withouth prior testing.