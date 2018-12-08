/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
    'Circuit',
    'lib/setImmediate',
    'shared/lib/createArray'
], function (Circuit, setImmediate, createArray) {
    var SIMULATION_CYCLE_REPEAT_COUNT = 10;

    var simulationRunning = false;
    var simulationCircuit = null;

    var setImmediateHandle = null;

    var ticksPerSecond = 0;
    var currentTicksPerSecond = 0;
    var lastTicksPerSecondIntervalTime = null;

    function getCircuitState() {
        var componentsState = createArray(simulationCircuit.numComponentReferences, null);
        for (var i = 0; i < simulationCircuit.components.length; i++) {
            var component = simulationCircuit.components[i];

            if (component.reference !== null && component.getDisplayData) {
                componentsState[component.reference] = component.getDisplayData();
            }
        }

        var connectionsState = createArray(simulationCircuit.numConnectionReferences, false);
        for (var i = 0; i < simulationCircuit.connections.length; i++) {
            var connection = simulationCircuit.connections[i];

            if (connection.reference !== null) {
                connectionsState[connection.reference] = connection.value;
            }
        }

        return {
            components: componentsState,
            connections: connectionsState,
            ticksPerSecond: ticksPerSecond
        };
    }

    function deserializeCircuits(serializedCircuits) {
        var circuits = {};

        for (var name in serializedCircuits) {
            if (serializedCircuits.hasOwnProperty(name)) {
                var serializedCircuit = serializedCircuits[name];
                var circuit = Circuit.deserializeForSimulation(name, serializedCircuit);
                circuits[name] = circuit;
            }
        }

        return circuits;
    }

    function compileCircuit(serializedCircuits) {
        var circuits = deserializeCircuits(serializedCircuits);

        for (var name in circuits) {
            if (circuits.hasOwnProperty(name)) {
                circuits[name].prepareSimulationCircuitCompilation();
            }
        }

        var compiledCircuit = circuits['main'].getSimulationCircuit(circuits);

        compiledCircuit.createReferences();

        compiledCircuit.init();

        return compiledCircuit;
    }

    function handleCompileCircuit(serializedCircuits) {
        if (simulationRunning) {
            postMessage({
                type: 'compile',
                success: false,
                message: 'Can\'t replace actively simulated circuit'
            });
            return;
        }

        try {
            var compiledCircuit = compileCircuit(serializedCircuits);

            simulationCircuit = compiledCircuit;

            postMessage({
                type: 'compile',
                success: true,
                mapping: compiledCircuit.deriveMapping(),
                initialState: getCircuitState()
            });
        } catch (e) {
            console.error(e);
            postMessage({
                type: 'compile',
                success: false,
                message: e.toString()
            });
        }
    }

    function handleGetCircuitState() {
        if (simulationCircuit === null) {
            postMessage({
                type: 'get-circuit-state',
                success: false,
                message: 'No circuit loaded'
            });
            return;
        }

        postMessage({
            type: 'get-circuit-state',
            success: true,
            state: getCircuitState()
        });
    }

    function handleStepSimulation(circuitStateRequested) {
        if (simulationCircuit === null) {
            postMessage({
                type: 'step-simulation',
                success: false,
                message: 'No circuit loaded'
            });
            return;
        }

        simulationCircuit.cycle();
        currentTicksPerSecond++;

        var circuitState = null;
        if (circuitStateRequested) {
            circuitState = getCircuitState();
        }

        postMessage({
            type: 'step-simulation',
            success: true,
            state: circuitState
        });
    }

    function doSimulationStep() {
        setImmediateHandle = setImmediate(doSimulationStep);

        for (var i = 0; i < SIMULATION_CYCLE_REPEAT_COUNT; i++) {
            simulationCircuit.cycle();
            currentTicksPerSecond++;
        }
    }

    function runSimulation() {
        if (simulationRunning) {
            return;
        }

        simulationRunning = true;

        setImmediateHandle = setImmediate(doSimulationStep);
    }

    function stopSimulation() {
        setImmediate.clearImmediate(setImmediateHandle);

        simulationRunning = false;
    }

    function handleRunSimulation() {
        if (simulationCircuit === null) {
            postMessage({
                type: 'run-simulation',
                success: false,
                message: 'No circuit loaded'
            });
            return;
        }

        runSimulation();

        postMessage({
            type: 'run-simulation',
            success: true
        });
    }

    function handleStopSimulation() {
        stopSimulation();

        postMessage({
            type: 'stop-simulation',
            success: true
        });
    }

    function handleUpdateInputs(inputData) {
        for (var i = 0; i < simulationCircuit.components.length; i++) {
            var component = simulationCircuit.components[i];

            if (component.reference !== null && inputData[component.reference] !== null) {
                component.updateInput(inputData[component.reference]);
            }
        }
    }

    setInterval(function () {
        var actualDuration;

        var now = Date.now();
        if (lastTicksPerSecondIntervalTime == null) {
            actualDuration = 1;
        } else {
            actualDuration = (now - lastTicksPerSecondIntervalTime) / 1000;
        }
        lastTicksPerSecondIntervalTime = now;

        ticksPerSecond = currentTicksPerSecond / actualDuration;
        currentTicksPerSecond = 0;
    }, 1000);

    self.onmessage = function (message) {
        var data = message.data;
        switch (data.type) {
            case 'compile':
                handleCompileCircuit(data.payload);
                break;
            case 'get-circuit-state':
                handleGetCircuitState();
                break;
            case 'step-simulation':
                handleStepSimulation(data.getCircuitState);
                break;
            case 'run-simulation':
                handleRunSimulation();
                break;
            case 'stop-simulation':
                handleStopSimulation();
                break;
            case 'update-inputs':
                handleUpdateInputs(data.inputData);
                break;
            default:
                console.warn('Message of unknown type received:', data.type);
        }
    };
});
