var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: './src/AngularServerRenderer.ts',
    externals: nodeModules,
    target: 'node',
    output: {
        library: 'angular.js-server',
        filename: 'dist/AngularServerRenderer.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts']
    },
    devtool: 'source-map',
    plugins: [
        //new webpack.optimize.UglifyJsPlugin({ minimize: true })
    ],
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: [
                    /test/,
                    /node_modules/,
                    /src-client/
                ]
            }
        ]
    }
};