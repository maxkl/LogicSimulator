/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function Circuit(components, connections) {
		this.components = components || [];
		this.connections = connections || [];
	}

	Circuit.prototype.cycle = function () {
		// Pass 1: calculate input values
		var n = this.connections.length;
		while(n--) {
			var connection = this.connections[n];
			connection.exec();
		}

		// Pass 2: calculate output values
		var n = this.components.length;
		while(n--) {
			var component = this.components[n];
			component.exec();
		}
	};

	return Circuit;
});
