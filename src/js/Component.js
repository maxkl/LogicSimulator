/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Component = (function (window, document) {
	"use strict";

	function Component(inputCount, outputCount, fn, displayFn) {
		this.inputCount = inputCount;
		this.outputCount = outputCount;
		this.fn = fn;
		this.displayFn = displayFn;

		this.inputValues = new Uint8Array(inputCount);
		this.outputValues = new Uint8Array(outputCount);

		this.hasDisplay = false;
		this.$container = null;
	}

	Component.prototype.initDisplay = function ($container) {
		this.hasDisplay = true;
		this.$container = $container;

		this.displayFn($container);
	};
	
	Component.prototype.execute = function () {
		this.fn(this.inputValues, this.outputValues);
	};

	return Component;
})(window, document);
