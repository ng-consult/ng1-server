/**
 * Created by antoine on 16/02/16.
 */

var contextify = require('contextify');
var fs = require('fs');


/**
 *
 * @param config {AngularServerConfig}
 * @returns {Array}
 */
exports.getClientJS = function( config ) {
    var javascriptFiles = config.getJavascriptFiles();
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

/**
 *
 * @returns {contextify}
 */
exports.getContext = function(){
    c_window = contextify({
        console : console
    });
    c_window.window = c_window.getGlobal();
    c_window.window.fs = fs;
    return c_window;
}

/**
 *
 * @param c_window  {contextify}
 * @param window {window}
 */
exports.closeSession = function( c_window, window ) {
    if (!window) {
        throw 'No window provided';
    }
    window.close();
    if (c_window) {
        try {
            c_window.dispose();
        }
        catch (e) {
            console.error('c_window.dispose() error');
        }
    } else {
        console.error('No c_window provided');
    }
}

/**
 *
 * @param c_window {contextify}
 * @param timeouts {Array}
 * @returns {string}
 */
exports.getHTML = function(c_window, timeouts) {

    var scope = c_window.window.angular.element(c_window.document).scope();
    scope.$apply();
    var html = '<html id="myApp">'
        + c_window.window.document.children[0].innerHTML
        + '</html>';

    for (var i in timeouts) {
        clearTimeout( timeouts[i]);
    }
    return html;
};