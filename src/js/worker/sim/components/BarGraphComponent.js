/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/createArray',
	'shared/lib/extend'
], function (Component, ComponentRegistry, createArray, extend) {
	function BarGraphComponent(args) {
		Component.call(this, args);

		this.in = createArray(args[0], false);
		this.out = [];
	}

	extend(BarGraphComponent, Component);

	BarGraphComponent.prototype.getDisplayData = function () {
		return this.in;
	};

	BarGraphComponent.prototype.exec = function () {};

	ComponentRegistry.register('bargraph', BarGraphComponent);

	return BarGraphComponent;
});
