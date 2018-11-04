/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
    'Circuit',
    'shared/lib/createArray'
], function (Circuit, createArray) {
    var simulationActive = false;
    var simulationCircuit = null;

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
            connections: connectionsState
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
        if (simulationActive) {
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

    function handleUpdateInputs(inputData) {
        for (var i = 0; i < simulationCircuit.components.length; i++) {
            var component = simulationCircuit.components[i];

            if (component.reference !== null && inputData[component.reference] !== null) {
                component.updateInput(inputData[component.reference]);
            }
        }
    }

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
            case 'update-inputs':
                handleUpdateInputs(data.inputData);
                break;
            default:
                console.warn('Message of unknown type received:', data.type);
        }
    };
});
