/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Renderer = (function (window, document) {
	"use strict";

	function Renderer(app) {
		this.log = new Logger("Renderer");

		this.app = app;
		
		this.$svg = document.getElementById("editor-svg");
		this.viewport = new Viewport(app, this.$svg);

		this.log.debug("Constructed");
	}

	return Renderer;
})(window, document);
