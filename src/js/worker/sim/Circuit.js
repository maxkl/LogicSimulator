/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define(function () {
	function Circuit(components, connections, inputConnections, outputConnections) {
		this.components = components || [];
		this.connections = connections || [];
		this.inputConnections = inputConnections || [];
		this.outputConnections = outputConnections || [];
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

		return new Circuit(newComponents, newConnections, newInputConnections, newOutputConnections);
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
