/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Logger = (function (window, document) {
	"use strict";

	var console = window.console;
	var concat = Array.prototype.concat;

	var enabledGlobally = true,
		globalLevel = 0;

	var levelIndices = {
		"debug": 0,
		"info": 1,
		"warn": 2,
		"error": 3
	};

	function Logger(name, enabled, level) {
		this.name = name;
		this.enabled = enabled !== false;
		this.level = levelIndices.hasOwnProperty(level) ? levelIndices[level] : 0;
	}

	Logger.prototype._call = function (thisArg, fn, args) {
		var prefix = this.name ? ["[" + this.name + "]"] : [];
		var allArgs = concat.apply(prefix, args);
		fn.apply(thisArg, allArgs);
	};

	Logger.prototype.enable = function () {
		this.enabled = true;
	};

	Logger.prototype.disable = function () {
		this.enabled = false;
	};

	Logger.prototype.setLevel = function (level) {
		if(levelIndices.hasOwnProperty(level)) {
			this.level = levelIndices[level];
		}
	};

	Logger.prototype.debug = function () {
		if(enabledGlobally && this.enabled &&
			globalLevel <= 0 && this.level <= 0) {
			this._call(console, console.log, arguments);
		}
	};

	Logger.prototype.info = function () {
		if(enabledGlobally && this.enabled &&
			globalLevel <= 1 && this.level <= 1) {
			this._call(console, console.info, arguments);
		}
	};

	Logger.prototype.warn = function () {
		if(enabledGlobally && this.enabled &&
			globalLevel <= 2 && this.level <= 2) {
			this._call(console, console.warn, arguments);
		}
	};

	Logger.prototype.error = function () {
		if(enabledGlobally && this.enabled &&
			globalLevel <= 3 && this.level <= 3) {
			this._call(console, console.error, arguments);
		}
	};

	Logger.enable = function () {
		enabledGlobally = true;
	};

	Logger.disable = function () {
		enabledGlobally = false;
	};

	Logger.setLevel = function (level) {
		if(levelIndices.hasOwnProperty(level)) {
			globalLevel = levelIndices[level];
		}
	};

	return Logger;
})(window, document);
