/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function Component(args) {
		this.args = Array.prototype.slice.call(args);
	}

	Component.prototype.construct = function () {
		var ctor = this.constructor;
		var args = [ null ].concat(this.args);
		var boundCtor = ctor.bind.apply(ctor, args);
		return new boundCtor();
	};

	return Component;
});
