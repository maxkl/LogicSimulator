/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var App = (function (window, document) {
	"use strict";

	function App() {
		console.log("App constructed");
	}

	App.prototype.start = function () {
		console.log("App started");
	};

	return App;
})(window, document);
