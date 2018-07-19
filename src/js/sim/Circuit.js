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
