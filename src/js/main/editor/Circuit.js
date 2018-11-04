/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define(function () {
	function Circuit(components, connections) {
		this.components = components;
		this.connections = connections;
		this.label = '?';
	}

	Circuit.prototype.serializeForSimulation = function () {
		var components = [];
		for (var i = 0; i < this.components.length; i++) {
			components.push(this.components[i].serializeForSimulation());
		}

		var connections = [];
		for (var i = 0; i < this.connections.length; i++) {
			connections.push(this.connections[i].serializeForSimulation());
		}
		
		return {
			components: components,
			connections: connections,
			label: this.label
		};
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
					label: component.getLabel(),
					component: component
				});
			} else if (component.isOutput) {
				outputs.push({
					x: component.x,
					y: component.y,
					label: component.getLabel(),
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

	return Circuit;
});
