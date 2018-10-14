/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function HalfAdderComponent() {
		Component.call(this);

		this.in = [false, false];
		this.out = [false, false];
	}

	extend(HalfAdderComponent, Component);

	HalfAdderComponent.prototype.exec = function () {
		var sum = this.in[0] + this.in[1];
		this.out[0] = !!(sum & 1);
		this.out[1] = !!(sum & 2);
	};

	ComponentRegistry.register('halfadder', HalfAdderComponent);

	return HalfAdderComponent;
});
