### simple to use angularRendere middle ware

### record execution time server vs client

### cors

- inject origial domain

### AngularJS hack

- ajax calls caching???


### fixes

- double slashes on ajax calls and views

### httpBackend Caching (HardCore caching)

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
