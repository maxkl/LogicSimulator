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
	function RegisterComponent(args) {
		Component.call(this, args);

		this.width = args[0];

		this.data = 0;

		this.in = createArray(3 + args[0], false);
		this.out = createArray(args[0], false);
		this.lastClk = false;

		this.lastOutputData = 0;
	}

	extend(RegisterComponent, Component);

	RegisterComponent.prototype.exec = function () {
		var clr = this.in[0];
		var oe = this.in[1];
		var clk = this.in[2];

		var clockEdge = !this.lastClk && clk;

		var outputData = 0;

		if (clr) {
			this.data = 0;
		} else {
			if (clockEdge) {
				var inputData = 0;
				for (var i = 0; i < this.width; i++) {
					if (this.in[3 + i]) {
						inputData |= 1 << i;
					}
				}
				this.data = inputData;
			}

			if (oe) {
				outputData = this.data;
			}
		}

		if (outputData !== this.lastOutputData) {
			for (var i = 0; i < this.width; i++) {
				this.out[i] = !!(outputData & (1 << i));
			}
		}

		this.lastOutputData = outputData;
		this.lastClk = clk;
	};

	ComponentRegistry.register('register', RegisterComponent);

	return RegisterComponent;
});
