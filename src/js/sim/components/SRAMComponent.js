/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/createArray',
	'lib/extend'
], function (Component, createArray, extend) {
	function SRAMComponent(addresswidth, datawidth) {
		Component.call(this, arguments);

		this.addresswidth = addresswidth;
		this.datawidth = datawidth;

		this.size = Math.pow(2, addresswidth);
		this.data = createArray(this.size, 0);

		this.in = createArray(2 + addresswidth + datawidth, false);
		this.out = createArray(datawidth, false);

		this.lastOutputData = 0;
	}

	extend(SRAMComponent, Component);

	SRAMComponent.prototype._clone = function () {
		return new SRAMComponent(this.addresswidth, this.datawidth);
	};

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

	return SRAMComponent;
});
