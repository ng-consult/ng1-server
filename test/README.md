As you can notice, only e2e testing is implemented. Unit testing is on the roadmap...

##test-app.js
To test the behavior of the server side renderer, the html caching and the rest caching, I am using the following methodology.

```bash
node test-server/server/test-app.js
```

which launches 4 express web servers: 
            
- Server 1 - Serving the angular app with no reference to ng-server 
- Server 2 - With pre-rendering enabled but Rest caching disabled
- Server 3 - With pre-rendering disabled and Rest caching enabled
- Server 4 - With pre-rendering enabled and Rest caching enabled

And the API server that is used by the web app http://127.0.01:8080/getProducts/:time 

It also launches the ng1-server with the cdn (proxy) server.

Then for each of these servers, I retrieve two HTML string.
First one is the HTML returned by the web server before being processed by the browser.
The second one is the HTML string rendered by phantomJS when the app triggers the IDLE status.

For server 1, we call the `curled` string `HTML1_curl`, and the `phantomjs` one `HTML1_js`, server 2 `HTML2_curl` and `HTML2_js` and so on.
  

## Rules to be met

These rules must be met : 

`HTML1_curl !== HTML1_js`

All js must be equal : 

`HTML1_js === HTML2_js === HTML3_js ===HTML4_js`

Additionally, all server side enabled server must render same curl and js

`HTML2_js === HTML2_curl`
`HTML4_js === HTML4_curl`

and 

`HTML3_curl === HTML1_curl`

## $http calls checks

All web app served with **server side rendering enabled** (`HTML2_js` and `HTML4_js`) should not make any $http call and as a consequence, should never query the API endpoint neither the cdn server.

All web apps served with **Rest caching enabled and server side rendering disabled** (`HTML3_js`) should never query the API endpoint, but the cdn endpoint instead.

All web app served with **server side rendering disabled and Rest caching disabled** (`HTML1_js`) should only query the API endpoint and skip the cdn server.
