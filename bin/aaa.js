#!/usr/bin/env node

"use strict";
var Client = require('./../dist/client');

var client = new Client('http://127.0.0.1:8881');

client.renderURL('http://localhost:3000/Main', function(result) {
    console.log('results = ', result);
});
