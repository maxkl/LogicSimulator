/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'sim/Component',
	'lib/createArray',
	'lib/extend'
], function (Component, createArray, extend) {
	function DEMUXComponent(selectLines) {
		Component.call(this, arguments);

		this.selectLines = selectLines;
		this.dataLines = Math.pow(2, selectLines);
		this.in = createArray(this.selectLines + 1, false);
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

	return DEMUXComponent;
});
