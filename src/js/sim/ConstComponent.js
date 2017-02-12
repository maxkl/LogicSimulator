/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function ConstComponent(value) {
		this.in = {};
		this.out = {
			Q: value
		};
	}

	ConstComponent.prototype.exec = function () {};

	return ConstComponent;
});
