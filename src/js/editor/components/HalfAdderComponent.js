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

		this.connectionPoints = [
			{
				out: false,
				x: -1,
				y: 3,
				name: 'A'
			},
			{
				out: false,
				x: -1,
				y: 7,
				name: 'B'
			},
			{
				out: true,
				x: 6,
				y: 3,
				name: 'S'
			},
			{
				out: true,
				x: 6,
				y: 7,
				name: 'C'
			}
		];

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);
	}

	extend(HalfAdderComponent, Component);

	HalfAdderComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	HalfAdderComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, ['A', 'B'], ['S', 'C'], 'HA');
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

	HalfAdderComponent.sidebarEntry = {
		name: 'Half Adder',
		category: 'Adder',
		drawPreview: function (svg) {
			displayComponent(svg, ['A', 'B'], ['S', 'C'], 'HA');
		}
	};

	return HalfAdderComponent;
});
