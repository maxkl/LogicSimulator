/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/EventEmitter',
	'lib/extend'
], function (EventEmitter, extend) {
	var TOOL_SELECT = 0;
	var TOOL_CONNECT = 1;
	var TOOL_PAN = 2;

	function EditorTools(app) {
		EventEmitter.call(this);

		this.app = app;

		this.currentTool = TOOL_SELECT;
		this.running = false;

		this.$run = document.getElementById('toolbar-run');
		this.$stop = document.getElementById('toolbar-stop');
		this.$pause = document.getElementById('toolbar-pause');

		this.registerListeners();
	}

	extend(EditorTools, EventEmitter);

	EditorTools.prototype.registerListeners = function () {
		var self = this;

		this.$run.addEventListener('click', function () {
			if(self.running) {
				self.$run.disabled = true;
				self.$pause.disabled = false;

				self.emit('resume');
			} else {
				self.running = true;

				self.$run.disabled = true;
				self.$stop.disabled = false;
				self.$pause.disabled = false;

				self.emit('run');
			}
		});

		this.$stop.addEventListener('click', function () {
			self.running = false;

			self.$run.disabled = false;
			self.$pause.disabled = true;
			self.$stop.disabled = true;

			self.emit('stop');
		});

		this.$pause.addEventListener('click', function () {
			self.$run.disabled = false;
			self.$pause.disabled = true;

			self.emit('pause');
		});

		document.getElementById('toolbar-tool-select').addEventListener('click', function (evt) {
			self.setTool(TOOL_SELECT);
		});

		document.getElementById('toolbar-tool-connect').addEventListener('click', function (evt) {
			if(!self.running) {
				self.setTool(TOOL_CONNECT);
			}
		});

		document.getElementById('toolbar-tool-pan').addEventListener('click', function (evt) {
			if(!self.running) {
				self.setTool(TOOL_PAN);
			}
		});

		document.getElementById('toolbar-action-delete').addEventListener('click', function () {
			self.emit('action-delete');
		});
	};

	EditorTools.prototype.setTool = function (tool) {
		if(this.currentTool !== tool) {
			var prev = this.currentTool;
			this.currentTool = tool;
			this.emit('tool-changed', tool, prev);
		}
	};

	EditorTools.TOOL_SELECT = TOOL_SELECT;
	EditorTools.TOOL_CONNECT = TOOL_CONNECT;
	EditorTools.TOOL_PAN = TOOL_PAN;

	return EditorTools;
});
