/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/SRAMComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimSRAMComponent, extend) {
	var COMPONENT_LABEL = 'SRAM';
	var COMPONENT_WIDTH = 11;

	function SRAMComponent() {
		Component.call(this);

		this.pins = null;

		this.width = 0;
		this.height = 0;
		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		var self = this;
		function updateLayout() {
			self.layout();
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'addresswidth', 'Address width', 'int', 4, updateLayout, { min: 1 } ],
			[ 'datawidth', 'Data width', 'int', 8, updateLayout, { min: 1, max: 32 } ]
		]);

		this.layout();
	}

	extend(SRAMComponent, Component);

	SRAMComponent.prototype._save = function (data) {
		data.addresswidth = this.properties.get('addresswidth');
		data.datawidth = this.properties.get('datawidth');
	};

	SRAMComponent.prototype._load = function (data) {
		this.properties.set('addresswidth', data.addresswidth);
		this.properties.set('datawidth', data.datawidth);

		this.layout();
	};

	SRAMComponent.prototype.layout = function () {
		var addresswidth = Math.max(1, this.properties.get('addresswidth'));
		var datawidth = Math.max(1, this.properties.get('datawidth'));

		var inputCount = 3 + addresswidth + datawidth;
		var outputCount = datawidth;

		var inputs = ['CS', 'OE', 'WE', null];
		for (var i = 0; i < addresswidth; i++) {
			inputs.push('A' + i);
		}
		inputs.push(null);
		for (var i = 0; i < datawidth; i++) {
			inputs.push('D' + i);
		}

		var outputs = [];
		for (var i = 0; i < datawidth; i++) {
			outputs.push('Q' + i);
		}

		var layout = displayComponent.layout(inputs, outputs, COMPONENT_WIDTH);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	SRAMComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	SRAMComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, COMPONENT_LABEL);
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	SRAMComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	SRAMComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	SRAMComponent.prototype.constructSimComponent = function () {
		return new SimSRAMComponent(this.properties.get('addresswidth'), this.properties.get('datawidth'));
	};

	SRAMComponent.typeName = 'sram';
	SRAMComponent.sidebarEntry = {
		name: 'SRAM',
		category: 'Memory',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(
				['CS', 'OE', 'WE', null, 'A0', 'A1', 'A2', 'A3', null, 'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
				['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
				COMPONENT_WIDTH
			);
			displayComponent(svg, layout.width, layout.height, layout.pins, COMPONENT_LABEL);
		}
	};

	return SRAMComponent;
});
