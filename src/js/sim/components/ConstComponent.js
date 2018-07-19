/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function ConstComponent(value) {
		Component.call(this, arguments);

		this.in = [];
		this.out = [value];
	}

	extend(ConstComponent, Component);

	ConstComponent.prototype._clone = function () {
		return new ConstComponent(this.out[0]);
	};

	ConstComponent.prototype.exec = function () {};

	return ConstComponent;
});
