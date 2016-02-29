/**
 * Created by antoine on 26/02/16.
 */
var yargs = require('yargs');
var ExpressHelper = require('./express/express');

var app = ExpressHelper.appServer();
ExpressHelper.appREST(app);

yargs.usage('$0  [args]')
    .command('restpi', 'Start the rest Api test server' , function (yargs, argv) {
        app.listen( 5555 );
        console.log('Test Rest API listening at http://localhost:5555 ');
    })
    .demand(1)
    .help('help')
    .argv;


