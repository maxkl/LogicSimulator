/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/createArray',
	'shared/lib/extend'
], function (Component, ComponentRegistry, createArray, extend) {
	function MUXComponent(args) {
		Component.call(this, args);

		this.selectLines = args[0];
		this.dataLines = Math.pow(2, args[0]);
		this.in = createArray(this.args[0] + this.dataLines, false);
		this.out = [false];
	}

	extend(MUXComponent, Component);

	MUXComponent.prototype.exec = function () {
		var select = 0;
		for(var i = 0; i < this.selectLines; i++) {
			if(this.in[i]) {
				select |= 1 << i;
			}
		}
		this.out[0] = this.in[this.selectLines + select];
	};

	ComponentRegistry.register('mux', MUXComponent);

	return MUXComponent;
});
