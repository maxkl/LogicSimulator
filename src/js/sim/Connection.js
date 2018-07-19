/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/ComponentPin'
], function (ComponentPin) {
	function Connection(inputs, outputs) {
		this.inputs = inputs || [];
		this.outputs = outputs || [];

		this.value = false;

		this.editorConnections = [];
	}

	Connection.prototype.merge = function (other) {
		for (var i = 0; i < other.inputs.length; i++) {
			this.inputs.push(other.inputs[i]);
		}

		for (var i = 0; i < other.outputs.length; i++) {
			this.outputs.push(other.outputs[i]);
		}

		for (var i = 0; i < other.editorConnections.length; i++) {
			this.editorConnections.push(other.editorConnections[i]);
		}
	};

	Connection.prototype.addInput = function (component, pinIndex) {
		this.inputs.push(new ComponentPin(component, pinIndex));
	};

	Connection.prototype.addOutput = function (component, pinIndex) {
		this.outputs.push(new ComponentPin(component, pinIndex));
	};

	Connection.prototype.exec = function () {
		var value = false;
		var n = this.inputs.length;
		while(n--) {
			var input = this.inputs[n];
			if(input.component.out[input.index]) {
				value = true;
			}
		}
		var n = this.outputs.length;
		while(n--) {
			var output = this.outputs[n];
			output.component.in[output.index] = value;
		}

		this.value = value;
	};

	return Connection;
});
