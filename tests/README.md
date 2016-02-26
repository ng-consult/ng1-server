#Test App: 
    test the Main Page displays ok with title
    test the todo renders after 2000ms
    test the todo add btn

#Test client
   http://localhost:3004 
   run Test App
   loads normal Angular.JS version
   test with curl that the index.html renders one line prerender
   save the phantom.js rendered page for /Main, /Error, and /Todo
   take a screenshot
        
#Test server
    http://localhost:3002
    run Test apps
    loads engine AngularJS version
    for each save, comppare with server, should be same
    for each screenshot, compare - should be same

#Test caching time.
    
    
    

#Test logs
    - info
    - warn
    - error
    - crash inside angular
    - outside angular
    - inside a rest service

#Test execution time
    - page should load in less than one second
    - page should load in more than 20 seconds