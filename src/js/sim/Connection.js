/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/ComponentPin'
], function (ComponentPin) {
	function Connection(inputs, outputs) {
		this.inputs = inputs || [];
		this.outputs = outputs || [];

		this.value = false;

		this.userData = null;
	}

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
