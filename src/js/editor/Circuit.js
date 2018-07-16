/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Connection',
	'sim/Circuit'
], function (SimConnection, SimCircuit) {
	function Circuit(components, connections) {
		this.components = components;
		this.connections = connections;
	}

	function ConstructionConnection(points, editorConnections) {
		this.points = points;
		this.editorConnections = editorConnections;
	}

	ConstructionConnection.prototype.merge = function (other, grid, connectionList) {
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

	Circuit.prototype.constructSimulationCircuit = function () {
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
					var con = new ConstructionConnection([pt], []);
					grid[pt] = con;
					connections.push(con);
				}
			}
		}

		// Look for connections that are touching each other at the endpoints
		for (var i = 0; i < this.connections.length; i++) {
			var editorConnnection = this.connections[i];

			var pt1 = editorConnnection.x1 + '|' + editorConnnection.y1;
			var pt2 = editorConnnection.x2 + '|' + editorConnnection.y2;

			if (grid[pt1] && grid[pt2]) {
				// There are connections at both endpoints
				// -> merge them
				grid[pt1].merge(grid[pt2], grid, connections);
				grid[pt1].editorConnections.push(editorConnnection);
			} else if (grid[pt1]) {
				// There is a connection at the first endpoint
				// -> add pt2 to it
				grid[pt1].points.push(pt2);
				grid[pt1].editorConnections.push(editorConnnection);
				grid[pt2] = grid[pt1];
			} else if (grid[pt2]) {
				// There is a connection at the second endpoint
				// -> add pt1 to it
				grid[pt2].points.push(pt1);
				grid[pt2].editorConnections.push(editorConnnection);
				grid[pt1] = grid[pt2];
			} else {
				// There is no connection at either endpoint
				// -> create a new connection connecting both endpoints
				var editorConnection = new ConstructionConnection([pt1, pt2], [editorConnnection]);
				grid[pt1] = grid[pt2] = editorConnection;
				connections.push(editorConnection);
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
			simulationConnection.userData = connection.editorConnections;

			// Replace all references in the grid
			for (var j = 0; j < connection.points.length; j++) {
				var pt = connection.points[j];
				grid[pt] = simulationConnection;
			}

			connections[i] = simulationConnection;
		}

		// Finally, use the constructed simulation connections to connect the components
		for (var i = 0; i < this.components.length; i++) {
			var editorComponent = this.components[i];
			var pins = editorComponent.pins;

			var simulationComponent = editorComponent.constructSimComponent();
			if (simulationComponent !== null) {
				simulationComponent.userData = editorComponent;
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

		return new SimCircuit(components, connections);
	};

	return Circuit;
});
