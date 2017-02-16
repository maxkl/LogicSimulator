/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	return function extend(Sub, Base) {
		Sub.prototype = Object.create(Base.prototype);
		Sub.prototype.constructor = Sub;
	};
});
