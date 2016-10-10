"use strict";
var page = require('webpage').create();
console.log('The default user agent is ' + page.settings.userAgent);
page.settings.userAgent = 'SpecialAgent';
///socket.io/socket.io.js


var config = {
    onServer: true,
    socketServer: 'localhost:8080',
    cacheServer: 'http://localhost:8888/PHANTOM/'
};

var cacheServer = 'http://localhost:8888/PHANTOM/';

var socketServer = 'http://localhost:9999';

var internalSocket = io();

/*
page.onResourceRequested = function(requestData, networkRequest) {
    const url = cacheServer + requestData.method + '/' + encodeURIComponent(requestData.url)
    networkRequest.changeUrl(url);
};*/

page.onInitialized = function() {
    page.inject('socket.io/socket.io.js');

    page.evaluate(function(config, host) {

        var ws = new WebSocket('ws://' + host);
        ws.send()

        window.socket = io();
        window.socket.emit('initialized', {});

        window.onServer = true;
        window.addEventListener('Idle', function() {
            //send socket rendered
            window.socket.emit('initialized', document.defaultView);
            phantom.exit();
            //close

        })
    }, config, host);
};
page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
        });
    }

    internalSocket.emit('error', msgStack);
    phantom.exit(1);
    //close
};

var time = Date.now();

page.open('http://www.httpuseragent.org', function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    }
    setTimeout(function() {
        phantom.exit();
    }, serverTimeout);

});
