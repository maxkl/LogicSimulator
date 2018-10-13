/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function PushButtonComponent() {
		Component.call(this, arguments);

		this.in = [];
		this.out = [false];

		this.pressed = false;
	}

	extend(PushButtonComponent, Component);

	PushButtonComponent.prototype.exec = function () {
		if(this.pressed) {
			this.pressed = false;
			this.out[0] = true;
		} else {
			this.out[0] = false;
		}
	};

	return PushButtonComponent;
});
