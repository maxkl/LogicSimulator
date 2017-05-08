/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function XorComponent() {
		Component.call(this, arguments);

		this.in = [false, false];
		this.out = [false];
	}

	extend(XorComponent, Component);

	XorComponent.prototype.exec = function () {
		this.out[0] = !(this.in[0] && this.in[1]) && (this.in[0] || this.in[1]);
	};

	return XorComponent;
});
