/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function NotComponent() {
		Component.call(this);

		this.in = [false];
		this.out = [true];
	}

	extend(NotComponent, Component);

	NotComponent.prototype.exec = function () {
		this.out[0] = !this.in[0];
	};

	ComponentRegistry.register('not', NotComponent);

	return NotComponent;
});
