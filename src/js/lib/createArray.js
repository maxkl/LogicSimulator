/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	return function createArray(size, value) {
		var a = new Array(size);
		if(typeof value === 'function') {
			for(var i = 0; i < size; i++) {
				a[i] = value(i);
			}
		} else if(typeof value !== 'undefined') {
			for(var i = 0; i < size; i++) {
				a[i] = value;
			}
		}
		return a;
	};
});
