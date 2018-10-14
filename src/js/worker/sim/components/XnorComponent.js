/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function XnorComponent() {
		Component.call(this);

		this.in = [false, false];
		this.out = [true];
	}

	extend(XnorComponent, Component);

	XnorComponent.prototype.exec = function () {
		this.out[0] = (this.in[0] && this.in[1]) || (!this.in[0] && !this.in[1]);
	};

	ComponentRegistry.register('xnor', XnorComponent);

	return XnorComponent;
});
