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

		document.getElementById('toolbar-run').addEventListener('click', function () {
			self.emit('run');
		});
	};

	return EditorTools;
});
