/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/createArray',
	'lib/extend'
], function (Component, createArray, extend) {
	function MUXComponent(selectLines) {
		Component.call(this, arguments);

		this.selectLines = selectLines;
		this.dataLines = Math.pow(2, selectLines);
		this.in = createArray(this.selectLines + this.dataLines, false);
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

	return MUXComponent;
});
