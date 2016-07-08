/**
 * Created by antoine on 16/02/16.
 */

var contextify = require('contextify');
var fs = require('fs');


var AngularDomJS = function(config) {

    this.config = config;
    this.c_window = contextify({
        console : console
    });
    this.c_window.window = this.c_window.getGlobal();
    this.c_window.window.config = config;
    this.c_window.window.fs = fs;


    this.getClientJS = function() {
        var javascriptFiles = this.config.server.jsFiles;
        javascriptFiles.forEach( function (file) {
            if (!fs.existsSync(file)) {
                throw new Error('The file ' + file + 'does\t exists.');
            }
        });

        var fileSrc = [];
        for(var i in javascriptFiles) {
            fileSrc[i] = fs.readFileSync(javascriptFiles[i] , 'utf8');
        }
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

        return this.c_window.window.document.children[0].innerHTML;
    };

};


module.exports = AngularDomJS;