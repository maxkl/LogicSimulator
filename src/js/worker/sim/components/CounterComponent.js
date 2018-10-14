/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/createArray',
	'shared/lib/extend'
], function (Component, ComponentRegistry, createArray, extend) {
	function CounterComponent(args) {
		Component.call(this, args);

		this.width = args[0];
		this.mask = Math.pow(2, args[0]) - 1;

		this.value = 0;

		this.in = createArray(6 + args[0], false);
		this.out = createArray(1 + args[0], false);
		this.lastClk = false;

		this.lastOutputData = 0;
	}

	extend(CounterComponent, Component);

	CounterComponent.prototype.exec = function () {
		var oe = this.in[0];
		var clr = this.in[1];
		var ld = this.in[2];
		var cen = this.in[3];
		var dir = this.in[4];
		var clk = this.in[5];

		var clockEdge = !this.lastClk && clk;

		var outputData = 0;

		if (clr) {
			this.value = 0;
		} else {
			if (clockEdge) {
				if (ld) {
					var inputData = 0;
					for (var i = 0; i < this.width; i++) {
						if (this.in[6 + i]) {
							inputData |= 1 << i;
						}
					}
					this.value = inputData;
				} else if (cen) {
					if (dir) {
						this.value = (this.value - 1) & this.mask;
					} else {
						this.value = (this.value + 1) & this.mask;
					}
				}
			}

			if (oe) {
				outputData = this.value;
			}
		}

		this.out[0] = dir ? (this.value === 0) : (this.value === this.mask);

		if (outputData !== this.lastOutputData) {
			for (var i = 0; i < this.width; i++) {
				this.out[1 + i] = !!(outputData & (1 << i));
			}
		}

		this.lastOutputData = outputData;
		this.lastClk = clk;
	};

	ComponentRegistry.register('counter', CounterComponent);

	return CounterComponent;
});
