/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function NotComponent() {
		this.in = {
			A: false
		};
		this.out = {
			Q: true
		};
	}

	NotComponent.prototype.exec = function () {
		this.out.Q = !this.in.A;
	};

	return NotComponent;
});
