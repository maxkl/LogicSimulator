/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/components/ClockComponent',
	'lib/extend'
], function (Component, displayComponent, SimClockComponent, extend) {
	function ClockComponent(period) {
		Component.call(this);

		this.period = period;

		this.component = new SimClockComponent(period);

		this.connectionPoints = [
			{
				out: true,
				x: 6,
				y: 3,
				name: 'Q'
			}
		];
	}

	extend(ClockComponent, Component);

	ClockComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, [], ['Q'], 'CLK');
		$handle.addEventListener('mousedown', mousedown);
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
