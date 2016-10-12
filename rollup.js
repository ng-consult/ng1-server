"use strict";
var rollup = require( 'rollup' );
var fs = require('fs-extra');
var babel  = require('rollup-plugin-babel');


var roll = function(i, o) {
    rollup.rollup({
        entry: 'compile/' + i + '.js',
        plugins: [ babel() ]
    }).then( function ( bundle ) {
        var result = bundle.generate({
            format: 'cjs'
        });
        fs.writeFileSync( 'dist/' + o + '.js', result.code );
    }, function(err) {
        console.log(err);
    });
};


var files = {
    'cacheServer': 'cache-server',
    'masterProcess': 'ng-server',
    'bridge': 'bridge-server',
    'client': 'client',
    'slimerPage': 'slimer-page'
};


for(var input in files) {
    roll.apply(null, [input, files[input]]);
}
