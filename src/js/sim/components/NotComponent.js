/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function NotComponent() {
		Component.call(this, arguments);

		this.in = {
			A: false
		};
		this.out = {
			Q: true
		};
	}

	extend(NotComponent, Component);

	NotComponent.prototype.exec = function () {
		this.out.Q = !this.in.A;
	};

	return NotComponent;
});
