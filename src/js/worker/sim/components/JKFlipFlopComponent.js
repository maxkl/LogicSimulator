/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/extend'
], function (Component, ComponentRegistry, extend) {
	function JKFlipFlopComponent() {
		Component.call(this);

		this.in = [false, false, false];
		this.out = [false, true];
		this.lastClk = false;
	}

	extend(JKFlipFlopComponent, Component);

	JKFlipFlopComponent.prototype.exec = function () {
		if(!this.lastClk && this.in[1]) {
			if(this.in[0] && this.in[2]) {
				this.out[0] = !this.out[0];
				this.out[1] = !this.out[1];
			} else if(this.in[0]) {
				this.out[0] = true;
				this.out[1] = false;
			} else if(this.in[2]) {
				this.out[0] = false;
				this.out[1] = true;
			}
		}
		this.lastClk = this.in[1];
	};

	ComponentRegistry.register('jkflipflop', JKFlipFlopComponent);

	return JKFlipFlopComponent;
});
