/**
 * Created by antoine on 11/09/16.
 */

function EngineQueue() {
    var self = this;
    var setTimeout = window.setTimeout;
    var clearTimeout = window.clearTimeout;
    var Event = window.Event;
    var dispatchEvent = window.dispatchEvent;

    /**
     *
     * @type {number} number of running promises
     */
    var promises= 0;
    /**
     *
     * @type {boolean}
     */
    var done= false;
    /**
     *
     * @type {number} idle bufer time in ms
     */
    var timeoutValue= 500;
    /**
     *
     * @type {TimeOut} the timeout that runs only when all the queues are empty with the idle check timeoutValue
     */
    var timeout= null;

    /**
     *
     * @param object Add an object:
     * @param type string httpBackend|promise|timeout
     */
    self.incr = function() {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        if (done === true) return;

        promises++;
    };

    /**
     *
     * @param object
     * @param string httpBackend|promise|timeout
     */
    self.decr =function() {
        if (done === true) return;

        promises--;

        if (timeout !== null) {
            clearTimeout(timeout);
        }

        if (promises === 0) {

            timeout = setTimeout(function() {
                if (promises === 0) {
                    var StackQueueEmpty = new Event('StackQueueEmpty');
                    if (typeof dispatchEvent === 'function') {
                        dispatchEvent(StackQueueEmpty);
                    }
                    done = true;
                }
            }, timeoutValue, false);
        }
    };

}

/**
 * @ngdoc service
 * @name $engineQueue
 * @requires
 *
 * @description
 * A Queue that stores the running status of the Angular APplication
 * An Empty queue means the application is in 'idle'.
 * It is used internally
 *
 */
export default function $EngineQueueProvider() {
    this.$get = [ function() {
        return new EngineQueue();
    }];
}


