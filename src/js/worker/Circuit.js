/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Connection',
	'sim/Circuit',
	'lib/DisjointSet',
	'ComponentRegistry'
], function (SimConnection, SimCircuit, DisjointSet, ComponentRegistry) {
	function EditorComponent(ref, x, y, isInput, isOutput, isCustom, circuitName, pins, constructor, simulationArguments) {
		this.ref = ref;
		this.x = x;
		this.y = y;
		this.isInput = isInput;
		this.isOutput = isOutput;
		this.isCustom = isCustom;
		this.circuitName = circuitName;
		this.pins = pins;
		this.constructor = constructor;
		this.simulationArguments = simulationArguments;
	}

	EditorComponent.deserializeForSimulation = function (data, ref) {
		var isInput = data.name === 'input';
		var isOutput = data.name === 'output';
		var isCustom = data.name === 'custom';

		var circuitName = isCustom ? data.circuitName : null;

		var constructor;
		if (isInput || isOutput || isCustom) {
			constructor = null;
		} else {
			constructor = ComponentRegistry.getConstructor(data.name);
			if (constructor === null) {
				throw new Error('No component with name \'' + data.name + '\' registered');
			}
		}

		var simulationArguments = data.args;

		return new EditorComponent(
			ref,
			data.x, data.y,
			isInput, isOutput, isCustom,
			circuitName,
			data.pins,
			constructor,
			simulationArguments
		);
	}

	function EditorConnection(ref, x1, y1, x2, y2, circuitName) {
		this.ref = ref;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.circuitName = circuitName;
	}

	EditorConnection.deserializeForSimulation = function (data, ref, circuitName) {
		return new EditorConnection(ref, data.x1, data.y1, data.x2, data.y2, circuitName);
	}

	function Circuit(circuitName, components, connections) {
		this.circuitName = circuitName;

		this.components = components;
		this.connections = connections;
		this.label = '?';

		this.isCompiling = false;
		this.cachedSimulationCircuit = null;
	}

	Circuit.deserializeForSimulation = function (circuitName, data) {
		var components = [];
		for (var i = 0; i < data.components.length; i++) {
			components.push(EditorComponent.deserializeForSimulation(data.components[i], i));
		}

		var connections = [];
		for (var i = 0; i < data.connections.length; i++) {
			connections.push(EditorConnection.deserializeForSimulation(data.connections[i], i, circuitName));
		}

		var circuit = new Circuit(circuitName, components, connections);
		circuit.label = data.label;
		
		return circuit;
	};

	Circuit.prototype.findInputsAndOutputs = function () {
		var inputs = [];
		var outputs = [];

		for (var i = 0; i < this.components.length; i++) {
			var component = this.components[i];

			if (component.isInput) {
				inputs.push({
					x: component.x,
					y: component.y,
					component: component
				});
			} else if (component.isOutput) {
				outputs.push({
					x: component.x,
					y: component.y,
					component: component
				});
			}
		}

		// Sort inputs and outputs from top to bottom and from left to right (as one would expect)
		function comparePosition(a, b) {
			if (a.y !== b.y) {
				return a.y - b.y;
			} else {
				return a.x - b.x;
			}
		}

		inputs.sort(comparePosition);
		outputs.sort(comparePosition);

		return {
			inputs: inputs,
			outputs: outputs
		};
	};

	Circuit.prototype.prepareSimulationCircuitCompilation = function () {
		this.isCompiling = false;
		this.cachedSimulationCircuit = null;
	};

	Circuit.prototype.getSimulationCircuit = function (circuits) {
		// We set the isCompiling flag before compiling nested circuits.
		//  This way, if this circuit is nested inside itself, the isCompiling flag is
		//  still set here and we detect that
		if (this.isCompiling) {
			throw new Error('Detected cyclic nesting of circuit');
		}

		if (this.cachedSimulationCircuit === null) {
			this.isCompiling = true;
			var simulationCircuit = this.compileSimulationCircuit(circuits);
			this.isCompiling = false;

			this.cachedSimulationCircuit = simulationCircuit;
		}

		return this.cachedSimulationCircuit.clone();
	};

	function CompilationConnection(points, editorConnections) {
		this.points = points;
		this.editorConnections = editorConnections;
	}

	CompilationConnection.prototype.merge = function (other, grid, connectionList) {
		if (other === this) {
			return;
		}

		// Transfer all points from `other` to `this`
		for (var i = 0; i < other.points.length; i++) {
			var point = other.points[i];
			this.points.push(point);
			grid[point] = this;
		}

		// Copy the editor connections
		for (var i = 0; i < other.editorConnections.length; i++) {
			this.editorConnections.push(other.editorConnections[i]);
		}

		// Remove `other` from the list of connections
		var index = connectionList.indexOf(other);
		if (index !== -1) {
			connectionList.splice(index, 1);
		} else {
			console.warn('`other` not in list of connections');
		}
	};

	function createSimulationComponent(editorComponent, needsReference) {
		var simulationComponent = new editorComponent.constructor(editorComponent.simulationArguments);
		simulationComponent.needsReference = needsReference;
		simulationComponent.editorComponent = editorComponent;
		return simulationComponent;
	}

	Circuit.prototype.compileSimulationCircuit = function (circuits) {
		// Holds components and connections hashed by their position in the editor
		var grid = {};

		var connections = [];
		var components = [];

		// Put all component pins as connections into the grid
		for (var i = 0; i < this.components.length; i++) {
			var editorComponent = this.components[i];

			var pins = editorComponent.pins;

			// Add a connection point for all pins
			for (var j = 0; j < pins.length; j++) {
				var pin = pins[j];

				var x = editorComponent.x + pin.x;
				var y = editorComponent.y + pin.y;
				var pt = x + '|' + y;

				if (!grid[pt]) {
					var con = new CompilationConnection([pt], []);
					grid[pt] = con;
					connections.push(con);
				}
			}
		}

		// Look for connections that are touching each other at the endpoints
		for (var i = 0; i < this.connections.length; i++) {
			var editorConnection = this.connections[i];

			var pt1 = editorConnection.x1 + '|' + editorConnection.y1;
			var pt2 = editorConnection.x2 + '|' + editorConnection.y2;

			if (grid[pt1] && grid[pt2]) {
				// There are connections at both endpoints
				// -> merge them
				grid[pt1].merge(grid[pt2], grid, connections);
				grid[pt1].editorConnections.push(editorConnection);
			} else if (grid[pt1]) {
				// There is a connection at the first endpoint
				// -> add pt2 to it
				grid[pt1].points.push(pt2);
				grid[pt1].editorConnections.push(editorConnection);
				grid[pt2] = grid[pt1];
			} else if (grid[pt2]) {
				// There is a connection at the second endpoint
				// -> add pt1 to it
				grid[pt2].points.push(pt1);
				grid[pt2].editorConnections.push(editorConnection);
				grid[pt1] = grid[pt2];
			} else {
				// There is no connection at either endpoint
				// -> create a new connection connecting both endpoints
				var con = new CompilationConnection([pt1, pt2], [editorConnection]);
				grid[pt1] = grid[pt2] = con;
				connections.push(con);
			}
		}

		// Look for connections that are crossing endpoints of other connections
		for (var i = 0; i < this.connections.length; i++) {
			var editorConnection = this.connections[i];

			var pt1 = editorConnection.x1 + '|' + editorConnection.y1;
			var connection1 = grid[pt1];

			if (editorConnection.x1 === editorConnection.x2) {
				// Vertical line
				var start = Math.min(editorConnection.y1, editorConnection.y2);
				var end = Math.max(editorConnection.y1, editorConnection.y2);
				// Check all points along the connection
				for (var y = start + 1; y < end; y++) {
					var pt2 = editorConnection.x1 + '|' + y;
					// If there is an endpoint touching this connection
					// -> merge both connections
					if (grid[pt2]) {
						connection1.merge(grid[pt2], grid, connections);
					}
				}
			} else {
				// Horizontal line
				var start = Math.min(editorConnection.x1, editorConnection.x2);
				var end = Math.max(editorConnection.x1, editorConnection.x2);
				// Check all points along the connection
				for (var x = start + 1; x < end; x++) {
					var pt2 = x + '|' + editorConnection.y1;
					// If there is an endpoint touching this connection
					// -> merge both connections
					if (grid[pt2]) {
						connection1.merge(grid[pt2], grid, connections);
					}
				}
			}
		}

		// Convert all the found connections to simulation connections
		for (var i = 0; i < connections.length; i++) {
			var connection = connections[i];

			var simulationConnection = new SimConnection();
			simulationConnection.needsReference = this.circuitName === 'main';
			simulationConnection.editorConnections = connection.editorConnections;

			// Replace all references in the grid
			for (var j = 0; j < connection.points.length; j++) {
				var pt = connection.points[j];
				grid[pt] = simulationConnection;
			}

			connections[i] = simulationConnection;
		}

		var inputConnections = [];
		var outputConnections = [];

		var connectionsToMerge = new DisjointSet();

		// Finally, use the compiled simulation connections to connect the components
		for (var i = 0; i < this.components.length; i++) {
			var editorComponent = this.components[i];
			var pins = editorComponent.pins;

			if (editorComponent.isCustom) {
				var subCircuit = circuits[editorComponent.circuitName].getSimulationCircuit(circuits);

				for (var j = 0; j < subCircuit.components.length; j++) {
					components.push(subCircuit.components[j]);
				}

				for (var j = 0; j < subCircuit.connections.length; j++) {
					connections.push(subCircuit.connections[j]);
				}

				for (var j = 0; j < pins.length; j++) {
					var pin = pins[j];

					var x = editorComponent.x + pin.x;
					var y = editorComponent.y + pin.y;
					var connection = grid[x + '|' + y];

					var pinConnection;

					if (pin.out) {
						pinConnection = subCircuit.outputConnections[pin.index];
					} else {
						pinConnection = subCircuit.inputConnections[pin.index];
					}

					// Mark the two connections for merging
					connectionsToMerge.union(
						connectionsToMerge.insert(pinConnection),
						connectionsToMerge.insert(connection)
					);
				}
			} else if (!editorComponent.isInput && !editorComponent.isOutput) {
				var simulationComponent = createSimulationComponent(editorComponent, this.circuitName === 'main');

				// Find the simulation connection for each pin and assign them
				for (var j = 0; j < pins.length; j++) {
					var pin = pins[j];

					var x = editorComponent.x + pin.x;
					var y = editorComponent.y + pin.y;
					var connection = grid[x + '|' + y];

					// Careful: outputs of a component are inputs to the connection
					if (pin.out) {
						connection.addInput(simulationComponent, pin.index);
					} else {
						connection.addOutput(simulationComponent, pin.index);
					}
				}
				components.push(simulationComponent);
			}
		}

		var mergedConnections = [];

		var setsToMerge = connectionsToMerge.getSets();
		for (var i = 0; i < setsToMerge.length; i++) {
			var setToMerge = setsToMerge[i];

			var targetConnection = setToMerge[0].data;

			for (var j = 1; j < setToMerge.length; j++) {
				var sourceConnection = setToMerge[j].data;

				targetConnection.merge(sourceConnection);

				var index = connections.indexOf(sourceConnection);
				if (index !== -1) {
					connections.splice(index, 1);
				} else {
					console.warn('merged connection that is not in `connections`');
				}

				mergedConnections.push([ sourceConnection, targetConnection ]);
			}
		}

		var inputsAndOutputs = this.findInputsAndOutputs();

		for (var i = 0; i < inputsAndOutputs.inputs.length; i++) {
			var input = inputsAndOutputs.inputs[i];
			var editorComponent = input.component;
			var pins = editorComponent.pins;

			for (var j = 0; j < pins.length; j++) {
				var pin = pins[j];

				var x = editorComponent.x + pin.x;
				var y = editorComponent.y + pin.y;
				var connection = grid[x + '|' + y];

				for (var k = 0; k < mergedConnections.length; k++) {
					if (mergedConnections[k][0] === connection) {
						connection = mergedConnections[k][1];
						break;
					}
				}

				// Careful: An input component has one _output_ pin, but is an input of the circuit
				if (pin.out) {
					if (editorComponent.isInput) {
						inputConnections.push(connection);
					}
				}
			}
		}

		for (var i = 0; i < inputsAndOutputs.outputs.length; i++) {
			var output = inputsAndOutputs.outputs[i];
			var editorComponent = output.component;
			var pins = editorComponent.pins;

			for (var j = 0; j < pins.length; j++) {
				var pin = pins[j];

				var x = editorComponent.x + pin.x;
				var y = editorComponent.y + pin.y;
				var connection = grid[x + '|' + y];

				for (var k = 0; k < mergedConnections.length; k++) {
					if (mergedConnections[k][0] === connection) {
						connection = mergedConnections[k][1];
						break;
					}
				}

				// Careful: An output component has one _input_ pin, but is an output of the circuit
				if (!pin.out) {
					if (editorComponent.isOutput) {
						outputConnections.push(connection);
					}
				}
			}
		}

		var simulationCircuit = new SimCircuit(components, connections, inputConnections, outputConnections);

		return simulationCircuit;
	};

	return Circuit;
});
