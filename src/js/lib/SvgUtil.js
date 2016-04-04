/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var SvgUtil = (function (window, document) {
	"use strict";

	var NS = "http://www.w3.org/2000/svg";

	function createSvgElement(name) {
		return document.createElementNS(NS, name);
	}

	return {
		createElement: createSvgElement
	};

})(window, document);
