### test wih js disabled in browser

### Benchmark

- record execution time server vs client
- load testing
- memory leak testing

### Remove the style injected by angualr in the head on page load, so they are not defined two times

It will help remove the tidy library used to display only the body in the tests

```
<style type="text/css">@charset "UTF-8";[ng\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-clo
```

### Note: all script tags must use absolute url
Seems like jsdom ignores the base path


### htmltidy before rendering
 
 
### Fix the common default cache path between restCache and cache

### Implement the host as a cache subdir, or Redis DB name

for example ngServer running on 2 different domains

    /cache/domain1/index.html
    /cache/domain2/index.html
    
for example, ngServer caching REST queries from different domains, jquery cdn and angular cdn

    /restCache/jquerycdn/jquery.js
    /restCache/angularcdn/angular.js
    /restCache/domain1/view1.html
    /restCache/domain2/view1.html
        
### better structure for the $window custom properties 

    serverConfig {
        
        // on Server   
        debug
        log
        fs
        timeout TODO
        $restCacheEmitter
        $cacheFactory
        
        // on Client
        debug       
        $angularServerCache                
    }

### Pending

1. simple-url-cache redis + test + publish + doc
2. Pass all ngServer test after simple-url-test
3. Finish testing RestCache client
4. Implement RestCache on  ngServer
5. test Restcache on ngServer unit
6. test RestCache on ngServer e2e
7. Implement cacching of external resources
    config.jsdom.cacheExternalResources(bool)
    config.jsdom.getCachedExternalResources()
    config.jsdom.clearCachedExternalResource(url)
    config.jsdom.clearAllCachedExternalResources()
    config.jsdom.sendToConsole(no, log, all)
    
    
