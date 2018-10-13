/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function ToggleButtonComponent() {
		Component.call(this, arguments);

		this.in = [];
		this.out = [false];

		this.pressed = false;
	}

	extend(ToggleButtonComponent, Component);

	ToggleButtonComponent.prototype.exec = function () {
		this.out[0] = this.pressed;
	};

	return ToggleButtonComponent;
});
