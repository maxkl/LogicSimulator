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

		this.in = {
			A: false,
			B: false
		};
		this.out = {
			S: false,
			C: false
		};
	}

	extend(HalfAdderComponent, Component);

	HalfAdderComponent.prototype.exec = function () {
		var sum = this.in.A + this.in.B;
		this.out.S = !!(sum & 1);
		this.out.C = !!(sum & 2);
	};

	return HalfAdderComponent;
});
