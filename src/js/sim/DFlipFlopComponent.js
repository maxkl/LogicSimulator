/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function DFlipFlopComponent() {
		Component.call(this, arguments);

		this.in = {
			D: false,
			CLK: false
		};
		this.out = {
			Q: false
		};
		this.lastClk = false;
	}

	extend(DFlipFlopComponent, Component);

	DFlipFlopComponent.prototype.exec = function () {
		if(!this.lastClk && this.in.CLK) {
			this.out.Q = this.in.D;
		}
		this.lastClk = this.in.CLK;
	};

	return DFlipFlopComponent;
});
