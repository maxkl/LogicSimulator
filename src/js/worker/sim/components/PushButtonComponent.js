/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function PushButtonComponent() {
		Component.call(this);

		this.in = [];
		this.out = [false];

		this.pressed = false;
	}

	extend(PushButtonComponent, Component);

	PushButtonComponent.prototype.updateInput = function (data) {
		this.pressed = data;
	};

	PushButtonComponent.prototype.exec = function () {
		if(this.pressed) {
			this.pressed = false;
			this.out[0] = true;
		} else {
			this.out[0] = false;
		}
	};

	ComponentRegistry.register('pushbutton', PushButtonComponent);

	return PushButtonComponent;
});
