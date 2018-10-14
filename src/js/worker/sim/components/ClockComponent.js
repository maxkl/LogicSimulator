/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function ClockComponent(args) {
		Component.call(this, args);

		this.period = args[0];
		this.halfPeriod = args[0] / 2;
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

	ComponentRegistry.register('clock', ClockComponent);

	return ClockComponent;
});
