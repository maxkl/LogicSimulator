/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function NotComponent() {
		Component.call(this, arguments);

		this.in = [false];
		this.out = [true];
	}

	extend(NotComponent, Component);

	NotComponent.prototype.exec = function () {
		this.out[0] = !this.in[0];
	};

	return NotComponent;
});
