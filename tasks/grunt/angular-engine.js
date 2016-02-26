/**
 * Created by antoine on 24/02/16.
 */
'use strict';

var angularEngineTask = require('./../angular-engine-task');

module.exports = function(grunt) {

    console.log('Engine task registration: grunt = ', grunt);
    grunt.registerTask('engine-server', 'Angular Server Pre-render.', function() {


        var options = this.options({
            server: {
                port: 3002,
                timeout: 30000,
                pid: unixifyPath( path.resolve( __dirname + '/server.pid') ),
                log: unixifyPath( path.resolve( __dirname + '/server.stdout') )
            },
            client: {
                port: 3004,
                pid: path.resolve( __dirname + '/client.pid'),
                log: path.resolve( __dirname + '/client.stdout')
            }
        });

        return angularEngineTask.runTask(options);
    });



};