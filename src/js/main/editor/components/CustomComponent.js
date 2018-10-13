/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, extend) {
	var COMPONENT_WIDTH = 11;

	function CustomComponent(app) {
		Component.call(this);

		this.app = app;

		this.isCustom = true;

		this.pins = null;

		this.width = 0;
		this.height = 0;
		this.pins = null;

		this.$container = null;
		this.$rect = null;

		var self = this;
		function edit() {
			if (self.circuitName === null) return;
			self.app.editor.openCircuit(self.circuitName);
		}

		this.properties = new ComponentProperties([
			[ 'name', '', 'helptext', '?' ],
			[ 'edit', 'Edit circuit', 'button', null, edit ]
		]);
		this.circuitName = null;

		this.layout();
	}

	extend(CustomComponent, Component);

	CustomComponent.prototype._save = function (data) {
		data.circuitName = this.circuitName;
	};

	CustomComponent.prototype._load = function (data) {
		this.circuitName = data.circuitName;

		this.layout();
	};

	CustomComponent.prototype.layout = function () {
		var inputs;
		var outputs;

		if (this.circuitName === null || !this.app.editor.circuits.hasOwnProperty(this.circuitName)) {
			inputs = ['', '', ''];
			outputs = ['', ''];
		} else {
			var inputsAndOutputs = this.app.editor.circuits[this.circuitName].findInputsAndOutputs();

			inputs = [];
			for (var i = 0; i < inputsAndOutputs.inputs.length; i++) {
				inputs.push(inputsAndOutputs.inputs[i].label);
			}

			outputs = [];
			for (var i = 0; i < inputsAndOutputs.outputs.length; i++) {
				outputs.push(inputsAndOutputs.outputs[i].label);
			}
		}

		var layout = displayComponent.layout(inputs, outputs, COMPONENT_WIDTH);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	CustomComponent.prototype.updatePins = function () {
		this.layout();
	};

	CustomComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	CustomComponent.prototype._updateDisplay = function () {
		this.layout();

		var label;
		if (this.circuitName === null) {
			label = '?';
		} else {
			label = this.app.editor.circuits[this.circuitName].label;
		}

		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, label);
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	CustomComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	CustomComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	CustomComponent.prototype.setCircuit = function (circuitName) {
		this.circuitName = circuitName;
		this.properties.set('name', circuitName);
		this._updateDisplay();
	};

	CustomComponent.prototype.constructSimComponent = function () {
		// TODO
		return null;
	};

	CustomComponent.typeName = 'custom';
	CustomComponent.sidebarEntry = {
		name: 'Custom',
		category: 'Custom components',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['', '', ''], ['', ''], COMPONENT_WIDTH);
			displayComponent(svg, layout.width, layout.height, layout.pins, '?');
		}
	};

	return CustomComponent;
});
