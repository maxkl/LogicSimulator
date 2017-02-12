/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function AndComponent() {
		this.in = {
			A: false,
			B: false
		};
		this.out = {
			Q: false
		};
	}

	AndComponent.prototype.exec = function () {
		this.out.Q = this.in.A && this.in.B;
	};

	return AndComponent;
});
