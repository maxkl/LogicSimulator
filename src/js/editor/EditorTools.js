/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/EventEmitter',
	'lib/extend'
], function (EventEmitter, extend) {
	var TOOL_NORMAL = 0;
	var TOOL_SELECT = 1;
	var TOOL_CONNECT = 2;

	function EditorTools(app) {
		EventEmitter.call(this);

		this.app = app;

		this.currentTool = TOOL_NORMAL;
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
				self.$run.classList.add('hidden');
				self.$pause.classList.remove('hidden');

				self.emit('resume');
			} else {
				self.running = true;

				self.$run.classList.add('hidden');
				self.$stop.classList.remove('hidden');
				self.$pause.classList.remove('hidden');

				self.emit('run');
			}
		});

		this.$stop.addEventListener('click', function () {
			self.running = false;

			self.$run.classList.remove('hidden');
			self.$pause.classList.add('hidden');
			self.$stop.classList.add('hidden');

			self.emit('stop');
		});

		this.$pause.addEventListener('click', function () {
			self.$run.classList.remove('hidden');
			self.$pause.classList.add('hidden');

			self.emit('pause');
		});

		document.getElementById('toolbar-tool-normal').addEventListener('click', function (evt) {
			self.setTool(TOOL_NORMAL);
		});

		document.getElementById('toolbar-tool-select').addEventListener('click', function (evt) {
			if(!self.running) {
				self.setTool(TOOL_SELECT);
			}
		});

		document.getElementById('toolbar-tool-connect').addEventListener('click', function (evt) {
			if(!self.running) {
				self.setTool(TOOL_CONNECT);
			}
		});
	};

	EditorTools.prototype.setTool = function (tool) {
		if(this.currentTool !== tool) {
			var prev = this.currentTool;
			this.currentTool = tool;
			this.emit('tool-changed', tool, prev);
		}
	};

	EditorTools.TOOL_NORMAL = TOOL_NORMAL;
	EditorTools.TOOL_SELECT = TOOL_SELECT;
	EditorTools.TOOL_CONNECT = TOOL_CONNECT;

	return EditorTools;
});
