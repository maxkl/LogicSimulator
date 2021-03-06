/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'shared/lib/extend'
], function (Component, ComponentProperties, displayComponent, extend) {
	function ClockComponent(period) {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;

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

	ClockComponent.prototype._save = function (data) {
		data.period = this.properties.get('period');
	};

	ClockComponent.prototype._load = function (data) {
		this.properties.set('period', data.period);
	};

	ClockComponent.prototype.layout = function () {
		var layout = displayComponent.layout([], ['']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	ClockComponent.prototype._display = function ($c) {
		this.$container = $c;
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

	ClockComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'clock',
			args: [ this.properties.get('period') ]
		};
	};

	ClockComponent.typeName = 'clock';
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
