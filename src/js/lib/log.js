/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Logger = (function (window, document) {
	"use strict";

	var console = window.console;
	var concat = Array.prototype.concat;

	function Logger(name) {
		this.name = name;
	}

	Logger.prototype._call = function (thisArg, fn, args) {
		var prefix = this.name ? ["[" + this.name + "]"] : [];
		var allArgs = concat.apply(prefix, args);
		fn.apply(thisArg, allArgs);
	};

	Logger.prototype.debug = function () {
		this._call(console, console.log, arguments);
	};

	Logger.prototype.info = function () {
		this._call(console, console.info, arguments);
	};

	Logger.prototype.warn = function () {
		this._call(console, console.warn, arguments);
	};

	Logger.prototype.error = function () {
		this._call(console, console.error, arguments);
	};

	return Logger;
})(window, document);
