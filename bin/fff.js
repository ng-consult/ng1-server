#!/usr/bin/env node

var CacheServer = require('./../dist/cache-server');

var cacheServer = new CacheServer(process.argv[2]);

cacheServer.start();

console.log('SLIMER & REST SERVER started');
