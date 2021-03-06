/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define(function () {
	var NS = 'http://www.w3.org/2000/svg';

	function createSvg() {
		return document.createElementNS(NS, 'svg');
	}

	function createSvgElement(name) {
		return document.createElementNS(NS, name);
	}

	return {
		createSvg: createSvg,
		createElement: createSvgElement
	};
});
