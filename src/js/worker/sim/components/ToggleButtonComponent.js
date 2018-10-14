/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function ToggleButtonComponent() {
		Component.call(this);

		this.in = [];
		this.out = [false];

		this.pressed = false;
	}

	extend(ToggleButtonComponent, Component);

	ToggleButtonComponent.prototype.exec = function () {
		this.out[0] = this.pressed;
	};

	ComponentRegistry.register('togglebutton', ToggleButtonComponent);

	return ToggleButtonComponent;
});
