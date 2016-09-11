/**
 * Created by antoine on 11/09/16.
 */
module.exports = {
    entry: './ts/index.ts',
    output: {
        filename: 'js/build.js'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    }
}