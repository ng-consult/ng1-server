#!/usr/bin/env node
"use strict";

var Master = require('./../dist/ng-server');

console.log(Master);

var master = new Master(process.argv[2]);

master.start( (err) => {
    if(err) throw err;
});
