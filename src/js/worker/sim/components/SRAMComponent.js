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
	function SRAMComponent(args) {
		Component.call(this, args);

		this.addresswidth = args[0];
		this.datawidth = args[1];

		this.size = Math.pow(2, args[0]);
		this.data = createArray(this.size, 0);

		this.in = createArray(2 + args[0] + args[1], false);
		this.out = createArray(args[1], false);

		this.lastOutputData = 0;
	}

	extend(SRAMComponent, Component);

	SRAMComponent.prototype.exec = function () {
		var oe = this.in[0];
		var we = this.in[1];

		var outputData = 0;

		if (oe || we) {
			var address = 0;
			for (var i = 0; i < this.addresswidth; i++) {
				if (this.in[2 + i]) {
					address |= 1 << i;
				}
			}

			if (we) {
				var inputData = 0;
				for (var i = 0; i < this.datawidth; i++) {
					if (this.in[2 + this.addresswidth + i]) {
						inputData |= 1 << i;
					}
				}
				this.data[address] = inputData;
			}

			if (oe) {
				outputData = this.data[address];
			}
		}

		if (outputData !== this.lastOutputData) {
			for (var i = 0; i < this.datawidth; i++) {
				this.out[i] = !!(outputData & (1 << i));
			}
		}

		this.lastOutputData = outputData;
	};

	ComponentRegistry.register('sram', SRAMComponent);

	return SRAMComponent;
});
