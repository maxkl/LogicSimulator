/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'ComponentRegistry',
	'shared/lib/createArray',
	'shared/lib/extend'
], function (Component, ComponentRegistry, createArray, extend) {
	function NandComponent(args) {
		Component.call(this, args);

		this.in = createArray(args[0], false);
		this.out = [true];
	}

	extend(NandComponent, Component);

	NandComponent.prototype.exec = function () {
		for(var i = 0; i < this.in.length; i++) {
			if(!this.in[i]) {
				this.out[0] = true;
				return;
			}
		}
		this.out[0] = false;
	};

	ComponentRegistry.register('nand', NandComponent);

	return NandComponent;
});
