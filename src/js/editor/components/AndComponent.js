/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/AndComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimAndComponent, extend) {
	function AndComponent() {
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
				out: true,
				x: 6,
				y: 5,
				name: 'Q',
				index: 0
			}
		];

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);
	}

	extend(AndComponent, Component);

	AndComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	AndComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, ['A', 'B'], ['Q'], '&');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	AndComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	AndComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	AndComponent.prototype.constructSimComponent = function () {
		return new SimAndComponent();
	};

	AndComponent.sidebarEntry = {
		name: 'And',
		category: 'Gates',
		drawPreview: function (svg) {
			displayComponent(svg, ['A', 'B'], ['Q'], '&');
		}
	};

	return AndComponent;
});
