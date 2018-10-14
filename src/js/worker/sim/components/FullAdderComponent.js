/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function FullAdderComponent() {
		Component.call(this);

		this.in = [false, false, false];
		this.out = [false, false];
	}

	extend(FullAdderComponent, Component);

	FullAdderComponent.prototype.exec = function () {
		var sum = this.in[0] + this.in[1] + this.in[2];
		this.out[0] = !!(sum & 1);
		this.out[1] = !!(sum & 2);
	};

	ComponentRegistry.register('fulladder', FullAdderComponent);

	return FullAdderComponent;
});
