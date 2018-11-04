/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
    'shared/lib/createArray',
    'shared/lib/EventEmitter',
    'shared/lib/extend'
], function (createArray, EventEmitter, extend) {
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
                        self.emit('compile-ok', data.mapping, data.initialState);
                    } else {
                        self.emit('compile-failed', data.message);
                    }
                    break;
                case 'get-circuit-state':
                    if (data.success) {
                        self.emit('get-circuit-state-ok', data.state);
                    } else {
                        self.emit('get-circuit-state-failed', data.message);
                    }
                    break;
                case 'step-simulation':
                    if (data.success) {
                        self.emit('step-simulation-ok', data.state);
                    } else {
                        self.emit('step-simulation-failed', data.message);
                    }
                    break;
                case 'run-simulation':
                    if (data.success) {
                        self.emit('run-simulation-ok');
                    } else {
                        self.emit('run-simulation-failed', data.message);
                    }
                    break;
                case 'stop-simulation':
                    if (data.success) {
                        self.emit('stop-simulation-ok');
                    } else {
                        self.emit('stop-simulation-failed', data.message);
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

    SimulatorInterface.prototype.getCircuitState = function () {
        this.worker.postMessage({
            type: 'get-circuit-state'
        });
    };

    SimulatorInterface.prototype.stepSimulation = function (getCircuitState) {
        this.worker.postMessage({
            type: 'step-simulation',
            getCircuitState: getCircuitState
        });
    };

    SimulatorInterface.prototype.runSimulation = function () {
        this.worker.postMessage({
            type: 'run-simulation'
        });
    };

    SimulatorInterface.prototype.stopSimulation = function () {
        this.worker.postMessage({
            type: 'stop-simulation'
        });
    };

    SimulatorInterface.prototype.updateInputs = function (inputData) {
        this.worker.postMessage({
            type: 'update-inputs',
            inputData: inputData
        });
    };

    return SimulatorInterface;
});
