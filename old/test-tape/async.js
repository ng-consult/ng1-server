var test = require('tape');

var asyncFunction = function (callback) {
    setTimeout(callback, Math.random * 50);
};

test('master test', function (t) {
    test('inner test 1', function (tt) {
        tt.pass('inner test 1 before async call');
        asyncFunction(function () {
            tt.pass('inner test 1 in async callback');
            tt.end();
        })
    });

    test('inner test 2', function (ttt) {
        ttt.pass('inner test 2 before async call');
        asyncFunction(function () {
            ttt.pass('inner test 2 in async callback');
            ttt.end();
        })
    });

    t.end(); // test fails with or without this, is t.end in master test necessary?
});
