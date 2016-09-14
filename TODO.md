# Benchmark

- record execution time server vs client
- load testing
- memory leak testing

# Remove the style injected by angualr in the head on page load, so they are not defined two times

It will help remove the tidy library used to display only the body in the tests

```
<style type="text/css">@charset "UTF-8";[ng\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-clo
```