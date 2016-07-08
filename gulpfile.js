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

//var gulpAngularEngine = require('./tasks/gulp/angular-engine');



var config = {
    client: {
        entryFile: './src/app.js',
        outputDir: './dist/client',
        outputFile: 'app.js'
    },
    angular: {
        entryFile: './angular/server.js',
        outputDir: './dist/angular',
        outputFile: 'server.js'
    },
};


// clean the output directory
gulp.task('cleanClient', function(cb){
    rimraf(config.client.outputDir, cb);
});
gulp.task('cleanAngular', function(cb){
    rimraf(config.angular.outputDir, cb);
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




var bundlerServerAngular;
function getBundlerAngular() {
    if (!bundlerServerAngular) {
        bundlerServerAngular = watchify(browserify(config.angular.entryFile, _.extend({debug: true}, watchify.args)));
    }
    return bundlerServerAngular;
}

function bundleAngular() {
    return getBundlerAngular()
        .transform(babelify)
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe(source(config.angular.outputFile))
        .pipe(gulp.dest(config.angular.outputDir))
        .pipe(reload({ stream: true }));
}



gulp.task('build-persistent-angular', ['cleanAngular'], function() {
    return bundleAngular();
});


gulp.task('build-angular', ['build-persistent-angular'], function() {
    process.exit(0);
});



gulp.task('watch-angular', ['build-persistent-angular'], function() {

    getBundlerAngular().on('update', function() {
        gulp.start('build-persistent-angular')
    });
});



gulp.task('serve', function(cb) {
    gulpAngularEngine({});
});

