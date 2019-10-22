/**
 * Copyright: (c) 2019 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/createArray',
	'shared/lib/extend'
], function (Component, ComponentRegistry, createArray, extend) {
	function arrayBufferToArray(arrayBuffer, wordsize) {
		var wordBytes = wordsize / 8;

		var view = new DataView(arrayBuffer);

		var array = [];

		for (var i = 0; i < view.byteLength; i += wordBytes) {
			var v;

			if (wordBytes == 1) {
				v = view.getUint8(i, true);
			} else if (wordBytes == 2) {
				v = view.getUint16(i, true);
			} else if (wordBytes == 4) {
				v = view.getUint32(i, true);
			}

			array.push(v);
		}

		return array;
	}

	function ROMComponent(args) {
		Component.call(this, args);

		this.addresswidth = args[0];
		this.wordsize = args[1];

		this.data = arrayBufferToArray(args[2], this.wordsize);

		this.in = createArray(1 + this.addresswidth, false);
		this.out = createArray(this.wordsize, false);

		this.lastOutputData = 0;
	}

	extend(ROMComponent, Component);

	ROMComponent.prototype.exec = function () {
		var oe = this.in[0];

		var outputData = 0;

		if (oe) {
			var address = 0;
			for (var i = 0; i < this.addresswidth; i++) {
				if (this.in[1 + i]) {
					address |= 1 << i;
				}
			}

			if (oe) {
				if (address < this.data.length) {
					outputData = this.data[address];
				} else {
					outputData = 0;
				}
			}
		}

		if (outputData !== this.lastOutputData) {
			for (var i = 0; i < this.wordsize; i++) {
				this.out[i] = !!(outputData & (1 << i));
			}
		}

		this.lastOutputData = outputData;
	};

	ComponentRegistry.register('ROM', ROMComponent);

	return ROMComponent;
});
