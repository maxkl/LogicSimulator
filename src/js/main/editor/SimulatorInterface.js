/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
    'shared/lib/EventEmitter',
    'shared/lib/extend'
], function (EventEmitter, extend) {
    var WORKER_FILE = 'js/worker/worker.min.js';

    function SimulatorInterface() {
        EventEmitter.call(this);

        this.worker = new Worker(WORKER_FILE);

        var self = this;
        this.worker.onmessage = function (message) {
            var data = message.data;
            switch (data.type) {
                case 'compile':
                    if (data.success) {
                        self.emit('compile-ok');
                    } else {
                        self.emit('compile-failed', data.message);
                    }
                    break;
                default:
                    console.warn('Message of unknown type received:', message);
            }
        };
    }

    extend(SimulatorInterface, EventEmitter);

    SimulatorInterface.prototype.compileCircuit = function (serializedCircuits) {
        this.worker.postMessage({
            type: 'compile',
            payload: serializedCircuits
        });
    };

    return SimulatorInterface;
});
