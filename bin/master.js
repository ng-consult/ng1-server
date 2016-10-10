#!/usr/bin/env node

var Master = require('./../dist/masterProcess').default;


var master = new Master(process.argv[2]);
master.start();

console.log('Master process started');
