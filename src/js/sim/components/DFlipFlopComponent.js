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

		this.in = [false, false];
		this.out = [false];
		this.lastClk = false;
	}

	extend(DFlipFlopComponent, Component);

	DFlipFlopComponent.prototype.exec = function () {
		if(!this.lastClk && this.in[1]) {
			this.out[0] = this.in[0];
		}
		this.lastClk = this.in[1];
	};

	return DFlipFlopComponent;
});
