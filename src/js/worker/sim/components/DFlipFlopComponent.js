/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function DFlipFlopComponent() {
		Component.call(this);

		this.in = [false, false];
		this.out = [false, true];
		this.lastClk = false;
	}

	extend(DFlipFlopComponent, Component);

	DFlipFlopComponent.prototype.exec = function () {
		if(!this.lastClk && this.in[1]) {
			this.out[0] = this.in[0];
			this.out[1] = !this.in[0];
		}
		this.lastClk = this.in[1];
	};

	ComponentRegistry.register('dflipflop', DFlipFlopComponent);

	return DFlipFlopComponent;
});
