/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function ClockComponent(period) {
		this.period = period;
		this.halfPeriod = period / 2;
		this.in = {};
		this.out = {
			Q: false
		};

		this.ticks = 0;
	}

	ClockComponent.prototype.exec = function () {
		this.ticks++;
		if(this.ticks >= this.period) {
			this.ticks = 0;
		}

		this.out.Q = this.ticks >= this.halfPeriod;
	};

	return ClockComponent;
});
