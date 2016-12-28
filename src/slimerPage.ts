"use strict";

var page = require('webpage').create();
page.settings.userAgent = 'SpecialAgent';
var system = require('system');
const fs = require('fs');

import {SlimerIO, SlimerSocket} from './slimerIO';
import {ENUM_SLIMER_ERRORS, MSG, PARAM_SLIMER_ERROR} from './MESSAGES';


var uid:string = system.args[1];
var url = system.args[2];
var bridge_internal_url:string = system.args[3];
var PROXY_URL = system.args[4];
var filePath = system.args[5];

const slimerIO = new SlimerIO(bridge_internal_url);

var renderType: string = typeof filePath !== 'undefined' && filePath.length > 0 ? 'file' : 'url';

var html: string = null;

if (renderType === 'file') {

    if (!fs.isFile(filePath)) {
        console.log('FILE_ACCESS_ERROR  - file doesnt exists' + filePath);
        slimer.exit(ENUM_SLIMER_ERRORS.FILE_ACCESS_ERROR)
    }
    if (!fs.isReadable(filePath)) {
        console.log('FILE_ACCESS_ERROR - permission issue for ' + filePath);
        slimer.exit(ENUM_SLIMER_ERRORS.FILE_ACCESS_ERROR)
    }

    html = fs.read(filePath, {
        mode: 'r',
        charset: 'utf-8'
    });

    //console.log('HTML length = ' + html.length);
}

page.onLoadFinished = (status) => {
    //csole.log('Load Finished - Status: ' + status);
};

page.onConsoleMessage = (msg, lineNum, sourceId) => {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.onLoadStarted = () => {
    //console.log('onLoadStarted');
};

page.onResourceError = (error) => {
    console.log('RESOURCE ERROR: ' + JSON.stringify(error));
    slimerIO.createSocket('BI', bridge_internal_url, uid, function (socket:SlimerSocket) {
        const errorObject = {
            uid: uid,
            message: error.errorString,
            trace: [error.url]
        };
        socket.emit(MSG.ERROR, JSON.stringify(errorObject));

        socket.on(MSG.ERROR + uid, () => {
            socket.close();
            console.log('closing with code ' + ENUM_SLIMER_ERRORS.NETWORK_ERROR);
            slimer.exit(ENUM_SLIMER_ERRORS.NETWORK_ERROR);
        });
    });
};


page.onResourceTimeout = (error) => {
    console.log('RESOURCE TIMEOUT: ' + JSON.stringify(error));
    slimerIO.createSocket('BI', bridge_internal_url, uid, function (socket:SlimerSocket) {
        const errorObject = {
            uid: uid,
            message: error.errorString,
            trace: [error]
        };
        socket.emit(MSG.ERROR, JSON.stringify(errorObject));

        socket.on(MSG.ERROR + uid, () => {
            socket.close();
            //console.log('closing with code ' + ENUM_SLIMER_ERRORS.NETWORK_ERROR);
            slimer.exit(ENUM_SLIMER_ERRORS.NETWORK_ERROR);
        });
    });
};


page.onResourceRequested = (requestData, networkRequest) => {

    if (requestData.method === 'GET' || requestData.method === 'OPTION') {

        //console.log('requesting ', JSON.stringify(requestData));
        const requestedUrl:string = requestData.url;
        //don't redirect the socket.io client, and don't redirect the current page, nd dont redirect already redirected requests
        if (requestedUrl.indexOf(PROXY_URL) === -1 && requestedUrl.indexOf(url) === -1 && requestedUrl.indexOf('/socket.io/') === -1) {
            networkRequest.changeUrl(PROXY_URL + '/get?url=' + encodeURIComponent(requestedUrl));
        } else {
            //console.log('IGNORING URL ', requestedUrl);
        }
    }
};

page.onInitialized = () => {
    page.onCallback = (data)=> {

        switch (data.type) {
            case 'idle':
                //console.log('IDLE EVENT CAUGHT');
                slimer.exit(0);
                break;
            default:
                throw 'onCallback(type) unknown type ' + data.type;
        }
    };

    page.evaluate((uid, bridge_internal_url, PROXY_URL) => {
        //throw new Error('test error');
        window['onServer'] = true;
        window['serverConfig'] = window['serverConfig'] || {};
        window['serverConfig'] = Object.assign( window['serverConfig'], {
            uid: uid,
            socketServerURL: bridge_internal_url,
            clientTimeoutValue: 200,
            restServerURL: PROXY_URL,
            debug: false
        });
        window.addEventListener('Idle', () => {
            //console.log('Idle event caught in slimerPage.ts');
            window['callPhantom']({type: 'idle'})
        });
    }, uid, bridge_internal_url, PROXY_URL);

};

// from https://github.com/stacktracejs/error-stack-parser/blob/master/error-stack-parser.js
const parseTrace = (trace: string) => {
    const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    const extractLocation = (urlLike: string) => {
        // Fail-fast but return locations like "(native)"
        if (urlLike.indexOf(':') === -1) {
            return [urlLike];
        }

        var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
        var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
        return [parts[1], parts[2] || undefined, parts[3] || undefined];
    };


    const exploded: string[]  = trace.split('\n').filter( line => {
        return !line.match(SAFARI_NATIVE_CODE_REGEXP);
    });

    return exploded.map( (line) => {
        if (line.indexOf(' > eval') > -1) {
            line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
        }

        var tokens = line.split('@');
        var locationParts = extractLocation(tokens.pop());
        var functionName = tokens.join('@') || undefined;
        return {
            function: functionName,
            file: locationParts[0],
            line: locationParts[1],
            column: locationParts[2]
        }
    });
};

const onError = (msg, trace) => {

    if(typeof trace === 'string') {

        console.log('STRING TRACE = ', trace);
        trace = parseTrace(trace);
    }


    const errorObject:PARAM_SLIMER_ERROR = {
        message: msg,
        uid: uid,
        trace: []
    };

    if (trace && trace.length) {
        console.log(JSON.stringify(trace));
        trace.forEach(function (t) {
            errorObject.trace.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : '' + '\n\n'));
        });
    }
    console.log('ONERROR !!!! ONERROR !!! : ' + msg);
    console.log('TRACE');
    console.log(trace);

    console.log(JSON.stringify(errorObject));

    slimerIO.createSocket('BI', bridge_internal_url, uid, function (socket:SlimerSocket) {
        socket.emit(MSG.ERROR, JSON.stringify(errorObject));

        socket.on(MSG.ERROR + uid, () => {
            socket.close();
            console.log('closing with code ' + ENUM_SLIMER_ERRORS.WEBAPP_ERROR);
            slimer.exit(ENUM_SLIMER_ERRORS.WEBAPP_ERROR);
        });
    });
}

page.onError = (msg, trace) => {
    console.log('page.onError triggered');
    onError(msg, trace);
};

if (renderType === 'url') {
    try {
        page.open(url, (status) => {
            if (status !== 'success') {
                console.log('Unable to access network');
                slimer.exit(ENUM_SLIMER_ERRORS.NETWORK_ERROR);
            }
        });
    } catch (e) {
        onError("page.open(url): " + e.message, e.stack);
    }

} else {
    try {
        page.setContent(html, url);
        //console.log('page.setContent() called');
    } catch (e) {
        console.log('Error setting up content');
        console.log(html);
        onError("page.setContent(html, url): " + e.message, e.stack);
    }

}
