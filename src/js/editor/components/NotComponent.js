/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/NotComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimNotComponent, extend) {
	function NotComponent() {
		Component.call(this);

		this.connectionPoints = [
			{
				out: false,
				x: -1,
				y: 3,
				name: 'A',
				index: 0
			},
			{
				out: true,
				x: 6,
				y: 3,
				name: 'Q',
				index: 0
			}
		];

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);
	}

	extend(NotComponent, Component);

	NotComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	NotComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, ['A'], ['!Q'], '1');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	NotComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	NotComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	NotComponent.prototype.constructSimComponent = function () {
		return new SimNotComponent();
	};

	NotComponent.sidebarEntry = {
		name: 'Not',
		category: 'Gates',
		drawPreview: function (svg) {
			displayComponent(svg, ['A'], ['!Q'], '1');
		}
	};

	return NotComponent;
});
