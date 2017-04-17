/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/DFlipFlopComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimDFlipFlopComponent, extend) {
	function DFlipFlopComponent() {
		Component.call(this);

		this.connectionPoints = [
			{
				out: false,
				x: -1,
				y: 3,
				name: 'D'
			},
			{
				out: false,
				x: -1,
				y: 7,
				name: 'CLK'
			},
			{
				out: true,
				x: 6,
				y: 5,
				name: 'Q'
			}
		];

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);
	}

	extend(DFlipFlopComponent, Component);

	DFlipFlopComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	DFlipFlopComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, ['D', 'CLK'], ['Q'], 'D');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	DFlipFlopComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	DFlipFlopComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	DFlipFlopComponent.prototype.constructSimComponent = function () {
		return new SimDFlipFlopComponent();
	};

	DFlipFlopComponent.sidebarEntry = {
		name: 'D FF',
		category: 'Memory',
		drawPreview: function (svg) {
			displayComponent(svg, ['D', 'CLK'], ['Q'], 'D');
		}
	};

	return DFlipFlopComponent;
});
