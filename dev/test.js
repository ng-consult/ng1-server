//console.log(process.argv);

var system = require('system');
var args = system.args;

console.log(args[0]);
console.log(args[1]);
console.log(args[2]);


console.log('Loading a web page');
var page = require('webpage').create();
var url = 'http://phantomjs.org/';
page.open(url, function (status) {
    console.log('page is loaded');
    phantom.exit();
});

