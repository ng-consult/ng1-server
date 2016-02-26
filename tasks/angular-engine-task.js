/**
 * Created by antoine on 25/02/16.
 */
/**
 * Created by antoine on 24/02/16.
 */
'use strict';


var path = require('path');
var ps = require('ps-node');
var fs = require('fs');
var utils = require('./../server/utils');


var unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
        return filepath.replace(/\\/g, '/');
    } else {
        return filepath;
    }
};

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports.runTask = function(options) {

    if (!options) options = {};

    options = Object.assign({
        appName: 'myApp',
        server: {
            port: 3002,
            timeout: 30000,
            pid: path.resolve( __dirname + '/../../server.pid')
        },
        client: {
            port: 3004,
            pid: path.resolve( __dirname + '/../../client.pid')
        }
    }, options);

    var spawn = require('child_process').spawn;
    var process = {};

    ['server', 'client'].forEach(function(name) {


        var log = utils.getLogFile( options.appName, name);

        var console = process.console = log;

        var pid = options[name].pid;
        var port = options[name].port;

        if (fs.existsSync( ( pid ))) {
            ps.kill( fs.readFileSync( pid ), function( err ) {
                if (err) {
                    console.log('Server already killed - can\'t find PID ' + fs.readFileSync( pid ));
                    fs.unlinkSync( pid );
                }
                else {
                    console.log('Restarting server');
                    fs.unlinkSync( pid );
                }
            });
        }

        process[name] = spawn('node', ['./server/angularonserver.js', name, port ], {
            detached: true,
            stdio: [ 'ignore', 'ignore', 'ignore' ]
        });

        fs.appendFileSync( pid, process[name].pid);

        process[name].on('error', function(err) {
            console.error('Fail to start process ', name);
            console.error(err);
            fs.closeSync(logFile);
            throw err;
        });

        process[name].unref();
        console.log( name + ' started @ http://localhost:' + port);
    });

    return process;
};
