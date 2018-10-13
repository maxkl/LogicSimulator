/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/extend'
], function (Component, extend) {
	function SRLatchComponent() {
		Component.call(this, arguments);

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

	return SRLatchComponent;
});
