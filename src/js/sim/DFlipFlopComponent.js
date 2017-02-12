/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function DFlipFlopComponent() {
		this.in = {
			D: false,
			CLK: false
		};
		this.out = {
			Q: false
		};
		this.lastClk = false;
	}

	DFlipFlopComponent.prototype.exec = function () {
		if(!this.lastClk && this.in.CLK) {
			this.out.Q = this.in.D;
		}
		this.lastClk = this.in.CLK;
	};

	return DFlipFlopComponent;
});
