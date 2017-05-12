/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/NandComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimNandComponent, extend) {
	function NandComponent() {
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
			[ 'inputs', 'Input count', 'int', 2, updateLayout, { min: 2 } ]
		]);

		this.layout();
	}

	extend(NandComponent, Component);

	NandComponent.prototype._save = function (data) {
		data.inputs = this.properties.get('inputs');
	};

	NandComponent.prototype._load = function (data) {
		this.properties.set('inputs', data.inputs);

		this.layout();
	};

	NandComponent.prototype.layout = function () {
		var inputCount = Math.max(2, this.properties.get('inputs'));
		var inputs = [];
		for(var i = 0; i < inputCount; i++) {
			inputs.push('');
		}
		var layout = displayComponent.layout(inputs, ['!']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	NandComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	NandComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, '&');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	NandComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	NandComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	NandComponent.prototype.constructSimComponent = function () {
		return new SimNandComponent(this.properties.get('inputs'));
	};

	NandComponent.typeName = 'nand';
	NandComponent.sidebarEntry = {
		name: 'Nand',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['', ''], ['!']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '&');
		}
	};

	return NandComponent;
});
