/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/RegisterComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimRegisterComponent, extend) {
	var COMPONENT_LABEL = 'REG';
	var COMPONENT_WIDTH = 11;

	function RegisterComponent() {
		Component.call(this);

		this.pins = null;

		this.width = 0;
		this.height = 0;
		this.pins = null;

		this.$container = null;
		this.$rect = null;

		var self = this;
		function updateLayout() {
			self.layout();
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'width', 'Width', 'int', 8, updateLayout, { min: 1, max: 32 } ]
		]);

		this.layout();
	}

	extend(RegisterComponent, Component);

	RegisterComponent.prototype._save = function (data) {
		data.width = this.properties.get('width');
	};

	RegisterComponent.prototype._load = function (data) {
		this.properties.set('width', data.width);

		this.layout();
	};

	RegisterComponent.prototype.layout = function () {
		var width = Math.max(1, this.properties.get('width'));

		var inputCount = 4 + width;
		var outputCount = width;

		var inputs = ['CLR', 'OE', '>C', null];
		for (var i = 0; i < width; i++) {
			inputs.push('D' + i);
		}

		var outputs = [];
		for (var i = 0; i < width; i++) {
			outputs.push('Q' + i);
		}

		var layout = displayComponent.layout(inputs, outputs, COMPONENT_WIDTH);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	RegisterComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	RegisterComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, COMPONENT_LABEL);
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	RegisterComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	RegisterComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	RegisterComponent.prototype.constructSimComponent = function () {
		return new SimRegisterComponent(this.properties.get('width'));
	};

	RegisterComponent.typeName = 'register';
	RegisterComponent.sidebarEntry = {
		name: 'Register',
		category: 'Memory',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(
				['CLR', 'OE', '>C', null, 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
				['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
				COMPONENT_WIDTH
			);
			displayComponent(svg, layout.width, layout.height, layout.pins, COMPONENT_LABEL);
		}
	};

	return RegisterComponent;
});
