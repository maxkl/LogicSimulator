/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/createArray',
	'lib/extend'
], function (Component, createArray, extend) {
	function BarGraphComponent(size) {
		Component.call(this);

		this.in = createArray(size, false);
		this.out = [];
	}

	extend(BarGraphComponent, Component);

	BarGraphComponent.prototype._clone = function () {
		return new BarGraphComponent(this.in.length);
	};

	BarGraphComponent.prototype.exec = function () {};

	return BarGraphComponent;
});
