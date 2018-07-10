/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function DFlipFlopComponent() {
		Component.call(this, arguments);

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

	return DFlipFlopComponent;
});
