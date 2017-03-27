/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function OrComponent() {
		Component.call(this, arguments);

		this.in = {
			A: false,
			B: false
		};
		this.out = {
			Q: false
		};
	}

	extend(OrComponent, Component);

	OrComponent.prototype.exec = function () {
		this.out.Q = this.in.A || this.in.B;
	};

	return OrComponent;
});
