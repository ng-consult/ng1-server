# Benchmark

- record execution time server vs client
- load testing
- memeory leak testing

# Ajax calls caching

Modify the angular.JS cache (natively or via injectors)

1- When the server pre-render the page, it should serialize all the requested ajax calls (templates & REST) and stores them in a JSON file

```
[{
   url: string,
   type: string, //template | other
   headers_md5: string,
   count: integer, //number of time this url ahs been called during rendering
   response: string
}]
```

2- On render, the server injects this JSON file into the rendered HTML and assign a global var to it.

3- Once the client bootstraps, each ajax calls checks on this JSON object, and decrement the count.
 Once each element's count is zero, remove the caching functionality and resume normal behavior.
 Set a timeout to notify and logs the server if some requests are never replayed.

# Redis Caching

Implement file cache in redis (And http cache too)

