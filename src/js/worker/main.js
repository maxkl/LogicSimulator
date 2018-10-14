/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
    'Circuit'
], function (Circuit) {
    var simulationActive = false;
    var simulationCircuit = null;

    function deserializeCircuits(serializedCircuits) {
        console.log('Serialized circuits:', serializedCircuits);

        var circuits = {};

        for (var name in serializedCircuits) {
            if (serializedCircuits.hasOwnProperty(name)) {
                var serializedCircuit = serializedCircuits[name];
                var circuit = Circuit.deserializeForSimulation(serializedCircuit);
                circuits[name] = circuit;
            }
        }

        console.log('Deserialized circuits:', circuits);

        return circuits;
    }

    function compileCircuit(serializedCircuits) {
        var circuits = deserializeCircuits(serializedCircuits);

        var compiledCircuit = circuits['main'].getSimulationCircuit(circuits);

        return compiledCircuit;
    }

    function tryCompileCircuit(serializedCircuits) {
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

            console.log('Compiled circuit:', compiledCircuit);

            simulationCircuit = compiledCircuit;
 
            postMessage({
                type: 'compile',
                success: true
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

    self.onmessage = function (message) {
        var data = message.data;
        switch (data.type) {
            case 'compile':
                tryCompileCircuit(data.payload);
                break;
            case 'start-simulation':
                // TODO
                break;
            default:
                console.warn('Message of unknown type received:', data.type);
        }
    };

    console.log('Worker online!');
});
