
### Router Caching & configuration

Define the caching strategy on the server in a separate config file that supports URL rewriting (Apapche style): 


```javascript
{

  '/blog/[a-z]+/([0-9]+)': {
     server: true,
     strategy: function(id) { //id is coming from the regex extraction
        var cachingDate = CacheService.getCachingDate('blog', id);
        var lastModificationDate = Blog.getLastModificationDate(id);
        return cachingDate < lastModificationDate;
     }
  },
  '/weather/[a-z]*': {
     strategy: 3600 //re-generate the cache every hour
  },
  '/stocks/.*': {
     server: true,
     strategy: false, // never use the cache for this url 
   },
  '/chat/.*': {
       server: false, // No server rendering - serve <div ng-view></div> instead 
   },
}
```

### httpBackend Caching

Define the httpBackend caching strategy

 - REST Routes
    - local / remote
    - caching strategy : 
        - periodic
        - never
        - custom
            - shouldUseCache: function

 - HTML Templates
    - Always cache in prod ( no more filesystem access )
    - don't cache in development
    
In case the caching strategy is 'never', we should modify the httpBackend so it uses exactly the same result the server used to generate the HTML.
Angular Server should then wait for the client to finish rendering as well before purging memory.

- <div ng-app="myApp" ng-strict-di>
https://github.com/olov/ng-annotate
