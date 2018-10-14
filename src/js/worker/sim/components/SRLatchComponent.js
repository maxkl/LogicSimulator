/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function SRLatchComponent() {
		Component.call(this);

		this.in = [false, false];
		this.out = [false, true];
	}

	extend(SRLatchComponent, Component);

	SRLatchComponent.prototype.exec = function () {
		if(this.in[0]) {
			this.out[0] = true;
			this.out[1] = false;
		} else if(this.in[1]) {
			this.out[0] = false;
			this.out[1] = true;
		}
	};

	ComponentRegistry.register('srlatch', SRLatchComponent);

	return SRLatchComponent;
});
