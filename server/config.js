/**
 * Created by antoine on 07/07/16.
 */
module.exports = {
    name: "myApp",
    path: {
        log: path.resolve( __dirname + '/logs'),
        pid: path.resolve( __dirname + '/pids'),
        scripts: [],
    },
    server: {
        domain: '',
        port: 3000,
        pre_render: true,
    },
    cache: {
        type: 'file',
        fileDir: path.resolve( __dirname + '/cache'),
        cacheMaxAge: [],
        cacheAlways: [],
        cacheNever: [{
            regex: /.*/
        }],
        cacheTimeStamp: []
    }
};
