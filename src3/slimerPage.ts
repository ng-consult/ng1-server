"use strict";
var page = require('webpage').create();
page.settings.userAgent = 'SpecialAgent';
var system = require('system');
import {SlimerIO, SlimerSocket} from './slimerIO';

import {ENUM_SLIMER_ERRORS, MSG, PARAM_SLIMER_ERROR} from './MESSAGES';

declare var slimer:any;

var uid:string = system.args[1];
var url = system.args[2];
var CCC_2_url:string = system.args[3];
var FFF_URL = system.args[4];
var filePath = system.args[5];

const slimerIO = new SlimerIO(CCC_2_url);

var renderType = typeof filePath !== 'undefined' && filePath.length > 0 ? 'file' : 'url';

console.log('RENDERTYPE = ' + renderType);

if (renderType === 'file') {
    var fs = require('fs');
    if (!fs.isFile(filePath)) {
        slimer.exit(ENUM_SLIMER_ERRORS.FILE_ACCESS_ERROR)
    }
    if (!fs.isReadable(filePath)) {
        slimer.exit(ENUM_SLIMER_ERRORS.FILE_ACCESS_ERROR)
    }
    var html = fs.read(filePath, {
        mode: 'r',
        charset: 'utf-8'
    });
}

page.onLoadFinished = (status) => {
    //console.log('Load Finished - Status: ' + status);
};

page.onConsoleMessage = (msg, lineNum, sourceId) => {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

page.onLoadStarted = () => {
    //console.log('onLoadStarted');
};

page.onResourceError = (error) => {
    console.log('RESOURCE ERROR: ' + JSON.stringify(error));
    slimerIO.createSocket('CCC2', CCC_2_url, uid, function (socket:SlimerSocket) {
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
    slimerIO.createSocket('CCC2', CCC_2_url, uid, function (socket:SlimerSocket) {
        const errorObject = {
            uid: uid,
            message: error.errorString,
            trace: [error]
        };
        socket.emit(MSG.ERROR, JSON.stringify(errorObject));

        socket.on(MSG.ERROR + uid, () => {
            socket.close();
            console.log('closing with code ' + ENUM_SLIMER_ERRORS.NETWORK_ERROR);
            slimer.exit(ENUM_SLIMER_ERRORS.NETWORK_ERROR);
        });
    });
};


page.onResourceRequested = (requestData, networkRequest) => {

    if (requestData.method === 'GET' || requestData.method === 'OPTION') {

        const requestedUrl:string = requestData.url;
        //don't redirct the socket.io client, and dont redirect the current page, nd dont redirect already redirected requests
        if (requestedUrl.indexOf(FFF_URL) === -1 && requestedUrl.indexOf(url) === -1 && requestedUrl.indexOf('/socket.io/') === -1) {
            networkRequest.changeUrl(FFF_URL + '/get?url=' + encodeURIComponent(requestedUrl) + '&original-url=' + encodeURIComponent(url));
        } else {
            //console.log('IGNORING URL ', requestedUrl);
        }
    }
};

page.onInitialized = () => {
    page.onCallback = (data)=> {

        switch (data.type) {
            case 'idle':
                slimer.exit(0);
                break;
            default:
                throw 'unknown type ' + data.type;
        }
    };

    page.evaluate((uid, CCC_2_url, FFF_URL) => {
        //throw new Error('test error');
        window['onServer'] = true;
        window['serverConfig'] = {
            uid: uid,
            socketServerURL: CCC_2_url,
            clientTimeoutValue: 200,
            restServerURL: FFF_URL,
            debug: false
        };
        window.addEventListener('Idle', () => {
            console.log('Idle event caught in phantom');
            window['callPhantom']({type: 'idle'})
        });
    }, uid, CCC_2_url, FFF_URL);

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

        trace = parseTrace(trace);
    }


    const errorObject:PARAM_SLIMER_ERROR = {
        message: msg,
        uid: uid,
        trace: []
    };

    if (trace && trace.length) {
        trace.forEach(function (t) {
            errorObject.trace.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : '' + '\n\n'));
        });
    }
    console.log('ONERROR !!! ONERROR !!! : ' + msg);

    console.log(JSON.stringify(errorObject));

    slimerIO.createSocket('CCC2', CCC_2_url, uid, function (socket:SlimerSocket) {
        socket.emit(MSG.ERROR, JSON.stringify(errorObject));

        socket.on(MSG.ERROR + uid, () => {
            socket.close();
            console.log('closing with code ' + ENUM_SLIMER_ERRORS.WEBAPP_ERROR);
            slimer.exit(ENUM_SLIMER_ERRORS.WEBAPP_ERROR);
        });
    });
}

page.onError = (msg, trace) => {
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
    } catch (e) {
        onError("page.setContent(html, url): " + e.message, e.stack);
    }

}
