/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function ClockComponent(period) {
		Component.call(this, arguments);

		this.period = period;
		this.halfPeriod = period / 2;
		this.in = [];
		this.out = [false];

		this.ticks = 0;
	}

	extend(ClockComponent, Component);

	ClockComponent.prototype.exec = function () {
		this.ticks++;
		if(this.ticks >= this.period) {
			this.ticks = 0;
		}

		this.out[0] = this.ticks >= this.halfPeriod;
	};

	return ClockComponent;
});
