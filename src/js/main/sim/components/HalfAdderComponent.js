/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function HalfAdderComponent() {
		Component.call(this, arguments);

		this.in = [false, false];
		this.out = [false, false];
	}

	extend(HalfAdderComponent, Component);

	HalfAdderComponent.prototype.exec = function () {
		var sum = this.in[0] + this.in[1];
		this.out[0] = !!(sum & 1);
		this.out[1] = !!(sum & 2);
	};

	return HalfAdderComponent;
});
