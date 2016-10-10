#!/usr/bin/env node

var BBB = require('./../dist/BBB').default;

console.log(process.argv);

new BBB(process.argv[2]);


console.log('BBB SERRVER started');