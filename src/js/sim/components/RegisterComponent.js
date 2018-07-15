/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/createArray',
	'lib/extend'
], function (Component, createArray, extend) {
	function RegisterComponent(width) {
		Component.call(this, arguments);

		this.width = width;

		this.data = 0;

		this.in = createArray(3 + width, false);
		this.out = createArray(width, false);
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

	return RegisterComponent;
});
