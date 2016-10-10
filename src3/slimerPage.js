"use strict";
var page = require('webpage').create();
console.log('The default user agent is ' + page.settings.userAgent);
page.settings.userAgent = 'SpecialAgent';
var system = require('system');

/**
 * TODO
 *
 * var serverConfig = JSON.parse(system.args[1]);
 */


var uid = 'uid-1234';

var initialied = false;
page.onLoadFinished = function(status) {
    console.log('Load Finished - Status: ' + status);

};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.onLoadStarted = function() {
    console.log('onLoadStarted');

};

page.onResourceRequested = function(requestData, networkRequest) {
    //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
};

page.onInitialized = function() {
    console.log('initialized');

    page.evaluate(function() {
        //window.onServer = true;
        window.testServer = 'test';
    });
    page.onCallback = function(data){
        switch(data.type) {
            case 'idle':
                phantom.exit();
                break;
            default:
                throw 'unknown type ' + data.type;
        }
    };

    page.evaluate(function(uid) {
        window.onServer = true;
        window.serverConfig = {
            uid: uid,
            socketHostname: 'http://127.0.0.1:3333'
        };
        window.addEventListener('Idle', function() {
            console.log('Idle event caught in phantom');
            window.callPhantom({type: 'idle'})
        });
    }, uid);
    /*
    page.includeJs('http://127.0.0.1:3333/socket.io/socket.io.js', function() {

    });*/
};

page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : '' + '\n\n'));
        });
    }

    console.error(msgStack);
    phantom.exit(1);
    //close
};

var time = Date.now();

page.open('http://127.0.0.1:3000/Todo', function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
        phantom.exit();
    }

});

