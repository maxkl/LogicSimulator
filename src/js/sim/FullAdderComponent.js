/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function FullAdderComponent() {
		Component.call(this, arguments);

		this.in = {
			A: false,
			B: false,
			C: false
		};
		this.out = {
			S: false,
			C: false
		};
	}

	extend(FullAdderComponent, Component);

	FullAdderComponent.prototype.exec = function () {
		var sum = this.in.A + this.in.B + this.in.C;
		this.out.S = !!(sum & 1);
		this.out.C = !!(sum & 2);
	};

	return FullAdderComponent;
});
