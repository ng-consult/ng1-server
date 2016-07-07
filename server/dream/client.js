/**
 * Created by antoine on 17/02/16.
 */

export const AngularBootStrap = (angular, document, timeout, appName, selector) {

    var app;
    if (selector === document) {
        app = document;

    } else {
        app = document.getElementById(selector);

    }

    // Should register within EngineQueue
    setTimeout( function() {
        angular.bootstrap(app, [appName]);
    }, timeout);
};


export const AngularClient = (angular, document, timeout) => {
    var x = document.head.getElementsByTagName("style");
    for (var i = x.length - 1; i >= 0; i--) {
        x[i].parentElement.removeChild(x[i]);
    }
    // empty the prerender div
    var view = document.getElementById('prerendered');
    if (view) {
        view.innerHTML = '';
    }
    else {
        var view = '<div id="prerendered"></div>';
        document.body.appendChild(view);
    }
};
