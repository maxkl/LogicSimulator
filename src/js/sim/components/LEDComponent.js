/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function LEDComponent() {
		Component.call(this, arguments);

		this.in = [false];
		this.out = [];
	}

	extend(LEDComponent, Component);

	LEDComponent.prototype.exec = function () {};

	return LEDComponent;
});
