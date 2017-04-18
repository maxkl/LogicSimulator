/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/FullAdderComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimFullAdderComponent, extend) {
	function FullAdderComponent() {
		Component.call(this);

		this.pins = [
			{
				out: false,
				x: -1,
				y: 3,
				name: 'A',
				index: 0
			},
			{
				out: false,
				x: -1,
				y: 7,
				name: 'B',
				index: 1
			},
			{
				out: false,
				x: -1,
				y: 11,
				name: 'C',
				index: 2
			},
			{
				out: true,
				x: 6,
				y: 5,
				name: 'S',
				index: 0
			},
			{
				out: true,
				x: 6,
				y: 9,
				name: 'C',
				index: 1
			}
		];

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);
	}

	extend(FullAdderComponent, Component);

	FullAdderComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	FullAdderComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, ['A', 'B', 'C'], ['S', 'C'], 'FA');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	FullAdderComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	FullAdderComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	FullAdderComponent.prototype.constructSimComponent = function () {
		return new SimFullAdderComponent();
	};

	FullAdderComponent.sidebarEntry = {
		name: 'Full Adder',
		category: 'Adder',
		drawPreview: function (svg) {
			displayComponent(svg, ['A', 'B', 'C'], ['S', 'C'], 'FA');
		}
	};

	return FullAdderComponent;
});
