/**
 * Created by antoine on 16/02/16.
 */

var contextify = require('contextify');
var fs = require('fs');
var glob = require("glob")


var AngularDomJS = function(config) {

    this.config = config;
    this.c_window = contextify({
        console : console
    });
    this.c_window.window = this.c_window.getGlobal();
    this.c_window.window.config = config;
    this.c_window.window.fs = fs;


    this.getClientJS = function() {

        var fileSrc = [];
        
        this.config.server.jsFiles.forEach( function (fileGlob) {
            var files = glob.sync(fileGlob, {});
            files.forEach(function(file) {
                if (!fs.existsSync(file)) {
                    throw new Error('The file ' + file + 'does\t exists.');
                }
                fileSrc.push( fs.readFileSync(file , 'utf8'));
            });
        });

        return fileSrc;
    };

    this.getContext = function(){
        return this.c_window;
    };

    this.closeSession = function(window ) {
        if (!window) {
            throw 'No window provided';
        }
        window.close();
        if (this.c_window) {
            try {
                this.c_window.dispose();
            }
            catch (e) {
                console.error('c_window.dispose() error');
            }
        } else {
            console.error('No c_window provided');
        }
    };

    this.getHTML = function(timeouts) {

        var scope = this.c_window.window.angular.element(this.c_window.document).scope();
        scope.$apply();

        for (var i in timeouts) {
            clearTimeout( timeouts[i]);
        }

        return this.c_window.window.document.body.innerHTML;
    };

};


module.exports = AngularDomJS;