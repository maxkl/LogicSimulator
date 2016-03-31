/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var App = (function (window, document) {
	"use strict";

	function App() {
		this.log = new Logger("App");

		this.log.debug("Constructed");
	}

	App.prototype.start = function () {
		this.log.debug("Started");
	};

	return App;
})(window, document);
