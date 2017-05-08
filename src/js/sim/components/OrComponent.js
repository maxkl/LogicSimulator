/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/createArray',
	'lib/extend'
], function (Component, createArray, extend) {
	function OrComponent(size) {
		Component.call(this, arguments);

		this.in = createArray(size, false);
		this.out = [false];
	}

	extend(OrComponent, Component);

	OrComponent.prototype.exec = function () {
		for(var i = 0; i < this.in.length; i++) {
			if(this.in[i]) {
				this.out[0] = true;
				return;
			}
		}
		this.out[0] = false;
	};

	return OrComponent;
});
