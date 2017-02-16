/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/EventEmitter',
	'lib/extend'
], function (EventEmitter, extend) {
	function EditorTools(app) {
		EventEmitter.call(this);

		this.app = app;

		this.registerListeners();
	}

	extend(EditorTools, EventEmitter);

	EditorTools.prototype.registerListeners = function () {
		var self = this;

		window.run = function () {
			self.emit('run');
		};
	};

	return EditorTools;
});
