/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/HalfAdderComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimHalfAdderComponent, extend) {
	function HalfAdderComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(HalfAdderComponent, Component);

	HalfAdderComponent.prototype._save = function (data) {};

	HalfAdderComponent.prototype._load = function (data) {};

	HalfAdderComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['A', 'B'], ['S', 'C']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	HalfAdderComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	HalfAdderComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, 'HA');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	HalfAdderComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	HalfAdderComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	HalfAdderComponent.prototype.constructSimComponent = function () {
		return new SimHalfAdderComponent();
	};

	HalfAdderComponent.typeName = 'halfadder';
	HalfAdderComponent.sidebarEntry = {
		name: 'Half Adder',
		category: 'Adder',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['A', 'B'], ['S', 'C']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'HA');
		}
	};

	return HalfAdderComponent;
});
