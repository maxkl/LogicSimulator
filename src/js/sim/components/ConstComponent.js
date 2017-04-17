/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function ConstComponent(value) {
		Component.call(this, arguments);

		this.in = {};
		this.out = [value];
	}

	extend(ConstComponent, Component);

	ConstComponent.prototype.exec = function () {};

	return ConstComponent;
});
