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
	function DEMUXComponent(args) {
		Component.call(this, args);

		this.selectLines = args[0];
		this.dataLines = Math.pow(2, args[0]);
		this.in = createArray(this.args[0] + 1, false);
		this.out = createArray(this.dataLines, false);

		this.lastSelect = 0;
	}

	extend(DEMUXComponent, Component);

	DEMUXComponent.prototype.exec = function () {
		var select = 0;
		for(var i = 0; i < this.selectLines; i++) {
			if(this.in[i]) {
				select |= 1 << i;
			}
		}
		this.out[this.lastSelect] = 0;
		this.out[select] = this.in[this.selectLines];
		this.lastSelect = select;
	};

	ComponentRegistry.register('demux', DEMUXComponent);

	return DEMUXComponent;
});
