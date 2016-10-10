#!/usr/bin/env node

"use strict";
var AAA = require('./../dist/AAA').default;

var aaa = new AAA('http://127.0.0.1:8888','http://127.0.0.1:8889');
aaa.renderURL('/home', function(result) {
    console.log('results = ', result);
});
