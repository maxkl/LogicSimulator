/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function BufferComponent() {
		Component.call(this);

		this.in = [false];
		this.out = [false];
	}

	extend(BufferComponent, Component);

	BufferComponent.prototype.exec = function () {
		this.out[0] = this.in[0];
	};

	ComponentRegistry.register('buffer', BufferComponent);

	return BufferComponent;
});
