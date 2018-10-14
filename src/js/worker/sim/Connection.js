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

		this.editorConnectionReferences = [];
	}

	Connection.prototype.clone = function (oldComponents, newComponents) {
		var newInputs = [];
		var newOutputs = [];

		function findNewComponent(oldComponent) {
			var index = oldComponents.indexOf(oldComponent);
			if (index !== -1) {
				return newComponents[index];
			} else {
				console.warn('component not found in oldComponents');
				return oldComponent;
			}
		}

		for (var i = 0; i < this.inputs.length; i++) {
			var input = this.inputs[i];
			var newInput = new ComponentPin(findNewComponent(input.component), input.index);
			newInputs.push(newInput);
		}

		for (var i = 0; i < this.outputs.length; i++) {
			var output = this.outputs[i];
			var newOutput = new ComponentPin(findNewComponent(output.component), output.index);
			newOutputs.push(newOutput);
		}

		var newConnection = new Connection(newInputs, newOutputs);
		newConnection.value = this.value;
		newConnection.editorConnectionReferences = this.editorConnectionReferences.slice();

		return newConnection;
	};

	Connection.prototype.merge = function (other) {
		for (var i = 0; i < other.inputs.length; i++) {
			this.inputs.push(other.inputs[i]);
		}

		for (var i = 0; i < other.outputs.length; i++) {
			this.outputs.push(other.outputs[i]);
		}

		for (var i = 0; i < other.editorConnectionReferences.length; i++) {
			this.editorConnectionReferences.push(other.editorConnectionReferences[i]);
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
