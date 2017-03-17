/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/EventEmitter',
	'lib/extend'
], function (EventEmitter, extend) {
	var TOOL_NORMAL = 0;
	var TOOL_CONNECT = 1;

	function EditorTools(app) {
		EventEmitter.call(this);

		this.app = app;

		this.currentTool = TOOL_NORMAL;

		this.registerListeners();
	}

	extend(EditorTools, EventEmitter);

	EditorTools.prototype.registerListeners = function () {
		var self = this;

		document.getElementById('toolbar-run').addEventListener('click', function () {
			self.emit('run');
		});

		function makeOnToolClick(tool) {
			return function () {
				if(self.currentTool !== tool) {
					var prev = self.currentTool;
					self.currentTool = tool;
					self.emit('tool-changed', tool, prev);
				}
			};
		}

		document.getElementById('toolbar-tool-normal').addEventListener('click', makeOnToolClick(TOOL_NORMAL));
		document.getElementById('toolbar-tool-connect').addEventListener('click', makeOnToolClick(TOOL_CONNECT));
	};

	EditorTools.TOOL_NORMAL = TOOL_NORMAL;
	EditorTools.TOOL_CONNECT = TOOL_CONNECT;

	return EditorTools;
});
