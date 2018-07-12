/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function BufferComponent() {
		Component.call(this, arguments);

		this.in = [false];
		this.out = [false];
	}

	extend(BufferComponent, Component);

	BufferComponent.prototype.exec = function () {
		this.out[0] = this.in[0];
	};

	return BufferComponent;
});
