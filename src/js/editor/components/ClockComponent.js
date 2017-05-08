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

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'period', 'Period', 'int', 20, updateDisplay, { min: 2 } ]
		]);

		this.layout();
	}

	extend(ClockComponent, Component);

	ClockComponent.prototype.layout = function () {
		var layout = displayComponent.layout([], ['']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	ClockComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	ClockComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, 'CLK');
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
			var layout = displayComponent.layout([], ['']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'CLK');
		}
	};

	return ClockComponent;
});
