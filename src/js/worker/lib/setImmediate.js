/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define(function () {
    var setImmediate, clearImmediate;

    if (typeof self.setImmediate === 'function') {
        setImmediate = self.setImmediate;
        clearImmediate = self.clearImmediate;
    } else if (typeof MessageChannel === 'function') {
        var setImmediateChannel = new MessageChannel();
        var setImmediateQueue = [];
        var setImmediatePending = false;
        var currentBaseId = 1;

        setImmediateChannel.port2.onmessage = function setImmediateCallback() {
            setImmediatePending = false;

            var oldQueue = setImmediateQueue;
            setImmediateQueue = [];

            currentBaseId += oldQueue.length;

            for (var i = 0; i < oldQueue.length; i++) {
                var func = oldQueue[i];
                if (func !== null) {
                    func();
                }
            }
        };

        setImmediate = function setImmediate(func) {
            setImmediateQueue.push(func);

            if (!setImmediatePending) {
                setImmediatePending = true;
                setImmediateChannel.port1.postMessage(null);
            }

            return currentBaseId + setImmediateQueue.length - 1;
        };

        clearImmediate = function clearImmediate(id) {
            var index = id - currentBaseId;

            if (index >= 0 && index < setImmediateQueue.length) {
                setImmediateQueue[index] = null;
            }
        };
    } else {
        var setImmediateQueue = [];
        var setImmediatePending = false;
        var currentBaseId = 1;

        function setImmediateCallback() {
            setImmediatePending = false;

            var oldQueue = setImmediateQueue;
            setImmediateQueue = [];

            currentBaseId += oldQueue.length;

            for (var i = 0; i < oldQueue.length; i++) {
                var func = oldQueue[i];
                if (func !== null) {
                    func();
                }
            }
        }

        setImmediate = function setImmediate(func) {
            setImmediateQueue.push(func);

            if (!setImmediatePending) {
                setImmediatePending = true;
                setTimeout(0, setImmediateCallback);
            }

            return currentBaseId + setImmediateQueue.length - 1;
        };

        clearImmediate = function clearImmediate(id) {
            var index = id - currentBaseId;

            if (index >= 0 && index < setImmediateQueue.length) {
                setImmediateQueue[index] = null;
            }
        };
    }

    setImmediate.clearImmediate = clearImmediate;

    return setImmediate;
});
