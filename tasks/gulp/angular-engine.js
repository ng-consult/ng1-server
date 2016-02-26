/**
 * Created by antoine on 24/02/16.
 */
'use strict';

var angularEngineTask = require('./../angular-engine-task');

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function(options) {
    return angularEngineTask.runTask(options);
};
