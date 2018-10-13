/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/createArray',
	'lib/extend'
], function (Component, createArray, extend) {
	function NandComponent(size) {
		Component.call(this, arguments);

		this.in = createArray(size, false);
		this.out = [true];
	}

	extend(NandComponent, Component);

	NandComponent.prototype._clone = function () {
		return new NandComponent(this.in.length);
	};

	NandComponent.prototype.exec = function () {
		for(var i = 0; i < this.in.length; i++) {
			if(!this.in[i]) {
				this.out[0] = true;
				return;
			}
		}
		this.out[0] = false;
	};

	return NandComponent;
});
