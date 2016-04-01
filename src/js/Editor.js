/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Editor = (function (window, document) {
	"use strict";

	function Editor() {
		this.log = new Logger("Editor");
		
		this.log.debug("Constructed");
	}

	return Editor;
})(window, document);
