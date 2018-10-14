/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function ConstComponent(args) {
		Component.call(this, args);

		this.in = [];
		this.out = [args[0]];
	}

	extend(ConstComponent, Component);

	ConstComponent.prototype.exec = function () {};

	ComponentRegistry.register('const', ConstComponent);

	return ConstComponent;
});
