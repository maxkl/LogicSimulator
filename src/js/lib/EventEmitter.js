/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function EventEmitter() {
		this._listeners = {};
	}

	EventEmitter.prototype.on = function (eventName, listener) {
		if(typeof listener !== 'function') {
			throw new TypeError('Listener is not a function');
		}

		if(!this._listeners.hasOwnProperty(eventName)) {
			this._listeners[eventName] = [];
		}

		this._listeners[eventName].push(listener);

		return this;
	};

	EventEmitter.prototype.off = function (eventName, listener) {
		if(typeof listener === 'undefined') {
			delete this._listeners[eventName];
		} else {
			if(this._listeners.hasOwnProperty(eventName)) {
				var listeners = this._listeners[eventName];
				var index = listeners.indexOf(listener);
				if(index !== -1) {
					listeners.splice(index, 1);
				}
			}
		}

		return this;
	};

	EventEmitter.prototype.once = function (eventName, listener) {
		if(typeof listener !== 'function') {
			throw new TypeError('Listener is not a function');
		}

		this.on(eventName, function wrapper() {
			this.off(eventName, wrapper);
			listener.apply(this, arguments);
		});

		return this;
	};

	EventEmitter.prototype.emit = function (eventName) {
		if(this._listeners.hasOwnProperty(eventName)) {
			var listeners = this._listeners[eventName];
			if(listeners.length > 0) {
				var args = Array.prototype.slice.call(arguments, 1);
				var n = listeners.length;
				while(n--) {
					listeners[n].apply(this, args);
				}
			}
		}

		return this;
	};

	return EventEmitter;
});
