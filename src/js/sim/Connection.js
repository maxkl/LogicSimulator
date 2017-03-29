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

		this.userData = null;
	}

	Connection.prototype.addInput = function (component, pinName) {
		this.inputs.push(new ComponentPin(component, pinName));
	};

	Connection.prototype.addOutput = function (component, pinName) {
		this.outputs.push(new ComponentPin(component, pinName));
	};

	Connection.prototype.exec = function () {
		var value = false;
		var n = this.inputs.length;
		while(n--) {
			var input = this.inputs[n];
			if(input.component.out[input.name]) {
				value = true;
			}
		}
		var n = this.outputs.length;
		while(n--) {
			var output = this.outputs[n];
			output.component.in[output.name] = value;
		}
	};

	return Connection;
});
