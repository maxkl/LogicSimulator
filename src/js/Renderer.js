/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Renderer = (function (window, document) {
	"use strict";

	function Renderer() {
		this.log = new Logger("Renderer");
		
		this.svg = document.getElementById("editor-svg");

		this.log.debug("Constructed");
	}

	return Renderer;
})(window, document);
