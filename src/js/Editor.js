/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Editor = (function (window, document) {
	"use strict";

	function Editor(app) {
		this.log = new Logger("Editor");

		this.app = app;

		this.renderer = new Renderer(app);
		
		this.log.debug("Constructed");
	}

	return Editor;
})(window, document);
