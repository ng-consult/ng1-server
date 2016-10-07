"use strict";

var fn = function(cb) {

    setTimeout(function() {
        cb('ok');
    }, 2000);

}


fn(function(result) {
    console.log(result);
});

console.log('after');

