/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define(function () {
	var LOCALSTORAGE_PREFIX = 'LogicSimulator:';

	function Storage() {
		//
	}

	Storage.prototype.has = function (key) {
		return window.localStorage.getItem(LOCALSTORAGE_PREFIX + key) !== null;
	};

	Storage.prototype.remove = function (key) {
		window.localStorage.removeItem(LOCALSTORAGE_PREFIX + key);
	};

	Storage.prototype.getRaw = function (key) {
		return window.localStorage.getItem(LOCALSTORAGE_PREFIX + key);
	};

	Storage.prototype.get = function (key) {
		return JSON.parse(this.getRaw(key));
	};

	Storage.prototype.setRaw = function (key, value) {
		window.localStorage.setItem(LOCALSTORAGE_PREFIX + key, value);
	};

	Storage.prototype.set = function (key, value) {
		this.setRaw(key, JSON.stringify(value));
	};

	return Storage;
});
