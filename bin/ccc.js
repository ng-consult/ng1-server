#!/usr/bin/env node

var Bridge = require('./../dist/bridge-server');


new Bridge(process.argv[2]);


console.log('Bridge SERVERs started');