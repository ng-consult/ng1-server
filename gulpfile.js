var gulp = require('gulp');
var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var _ = require('lodash');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var annotate = require('gulp-ng-annotate');

var config = {
    client: {
        entryFile: './client/app.js',
        outputDir: './dist/client',
        outputFile: 'app.js'
    }
};


// clean the output directory
gulp.task('cleanClient', function(cb){
    rimraf(config.client.outputDir, cb);
});

var bundlerClient;
function getBundlerClient() {
    if (!bundlerClient) {
        bundlerClient = watchify(browserify(config.client.entryFile, _.extend({debug: true}, watchify.args)));
    }
    return bundlerClient;
}

function bundleClient() {
    return getBundlerClient()
        .transform(babelify)
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe(source(config.client.outputFile))
        .pipe(annotate())
        .pipe(gulp.dest(config.client.outputDir))
        .pipe(reload({ stream: true }));
}



gulp.task('build-persistent-client', ['cleanClient'], function() {
    return bundleClient();
});


gulp.task('build-client', ['build-persistent-client'], function() {
    process.exit(0);
});



gulp.task('watch-client', ['build-persistent-client'], function() {

    getBundlerClient().on('update', function() {
        gulp.start('build-persistent-client')
    });
});
