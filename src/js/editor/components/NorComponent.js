/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/NorComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimNorComponent, extend) {
	function NorComponent() {
		Component.call(this);

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
			[ 'inputs', 'Input count', 'int', 2, updateLayout ]
		]);

		this.layout();
	}

	extend(NorComponent, Component);

	NorComponent.prototype.layout = function () {
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

	NorComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	NorComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, '≥1');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	NorComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	NorComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	NorComponent.prototype.constructSimComponent = function () {
		return new SimNorComponent(this.properties.get('inputs'));
	};

	NorComponent.sidebarEntry = {
		name: 'Nor',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['', ''], ['!']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '≥1');
		}
	};

	return NorComponent;
});