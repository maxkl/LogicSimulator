/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/ClockComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimClockComponent, extend) {
	function ClockComponent(period) {
		Component.call(this);

		this.connectionPoints = [
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

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'period', 'Period', 'int', 20, updateDisplay ]
		]);
	}

	extend(ClockComponent, Component);

	ClockComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	ClockComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, [], ['Q'], 'CLK');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	ClockComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	ClockComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	ClockComponent.prototype.constructSimComponent = function () {
		return new SimClockComponent(this.properties.get('period'));
	};

	ClockComponent.sidebarEntry = {
		name: 'Clock',
		category: 'Basic',
		drawPreview: function (svg) {
			displayComponent(svg, [], ['Q'], 'CLK');
		}
	};

	return ClockComponent;
});
