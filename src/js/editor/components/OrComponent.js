/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/OrComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimOrComponent, extend) {
	function OrComponent() {
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
				y: 5,
				name: 'Q'
			}
		];

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);
	}

	extend(OrComponent, Component);

	OrComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	OrComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, ['A', 'B'], ['Q'], '≥1');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	OrComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	OrComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	OrComponent.prototype.constructSimComponent = function () {
		return new SimOrComponent();
	};

	OrComponent.sidebarEntry = {
		name: 'Or',
		category: 'Gates',
		drawPreview: function (svg) {
			displayComponent(svg, ['A', 'B'], ['Q'], '≥1');
		}
	};

	return OrComponent;
});
