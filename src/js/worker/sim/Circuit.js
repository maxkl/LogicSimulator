/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'shared/lib/createArray'
], function (createArray) {
	function Circuit(components, connections, inputConnections, outputConnections) {
		this.components = components || [];
		this.connections = connections || [];
		this.inputConnections = inputConnections || [];
		this.outputConnections = outputConnections || [];

		this.numComponentReferences = 0;
		this.numConnectionReferences = 0;
	}

	Circuit.prototype.clone = function () {
		var newComponents = [];
		var newConnections = [];
		var newInputConnections = [];
		var newOutputConnections = [];

		for (var i = 0; i < this.components.length; i++) {
			newComponents.push(this.components[i].clone());
		}

		for (var i = 0; i < this.connections.length; i++) {
			newConnections.push(this.connections[i].clone(this.components, newComponents));
		}

		var oldConnections = this.connections;
		function findNewConnection(oldConnection) {
			var index = oldConnections.indexOf(oldConnection);
			if (index !== -1) {
				return newConnections[index];
			} else {
				console.warn('connection not found in oldConnections');
				return oldConnection;
			}
		}

		for (var i = 0; i < this.inputConnections.length; i++) {
			newInputConnections.push(findNewConnection(this.inputConnections[i]));
		}

		for (var i = 0; i < this.outputConnections.length; i++) {
			newOutputConnections.push(findNewConnection(this.outputConnections[i]));
		}

		var circuit = new Circuit(newComponents, newConnections, newInputConnections, newOutputConnections);
		circuit.numComponentReferences = this.numComponentReferences;
		circuit.numConnectionReferences = this.numConnectionReferences;

		return circuit;
	};

	Circuit.prototype.createReferences = function () {
		var nextComponentReference = 0;
		for (var i = 0; i < this.components.length; i++) {
			var component = this.components[i];
			if (component.needsReference) {
				component.reference = nextComponentReference++;
			}
		}
		this.numComponentReferences = nextComponentReference;

		var nextConnectionReference = 0;
		for (var i = 0; i < this.connections.length; i++) {
			var connection = this.connections[i];
			if (connection.needsReference) {
				connection.reference = nextConnectionReference++;
			}
		}
		this.numConnectionReferences = nextConnectionReference;
	};

	Circuit.prototype.deriveMapping = function () {
		var componentsMapping = createArray(this.numComponentReferences, null);
		var connectionsMapping = createArray(this.numConnectionReferences, null);

		for (var i = 0; i < this.components.length; i++) {
			var reference = this.components[i].reference;
			if (reference !== null) {
				componentsMapping[reference] = this.components[i].editorComponent.ref;
			}
		}

		for (var i = 0; i < this.connections.length; i++) {
			var reference = this.connections[i].reference;
			if (reference !== null) {
				connectionsMapping[reference] = this.connections[i].editorConnections.filter(function (editorConnection) {
					return editorConnection.circuitName === 'main';
				}).map(function (editorConnection) {
					return editorConnection.ref;
				});
			}
		}

		return {
			components: componentsMapping,
			connections: connectionsMapping
		};
	};

	Circuit.prototype.init = function () {
		this.doConnections();
	};

	Circuit.prototype.doConnections = function () {
		var n = this.connections.length;
		while(n--) {
			var connection = this.connections[n];
			connection.exec();
		}
	};

	Circuit.prototype.cycle = function () {
		// calculate output values
		var n = this.components.length;
		while(n--) {
			var component = this.components[n];
			component.exec();
		}

		this.doConnections();
	};

	return Circuit;
});
