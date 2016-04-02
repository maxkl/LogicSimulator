/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var App = (function (window, document) {
	"use strict";

	function App() {
		this.log = new Logger("App");

		this.editor = new Editor(this);

		this.log.debug("Started");
	}

	return App;
})(window, document);
