/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function LEDComponent() {
		Component.call(this);

		this.in = [false];
		this.out = [];
	}

	extend(LEDComponent, Component);

	LEDComponent.prototype.getDisplayData = function () {
		return this.in[0];
	};

	LEDComponent.prototype.exec = function () {};

	ComponentRegistry.register('led', LEDComponent);

	return LEDComponent;
});
