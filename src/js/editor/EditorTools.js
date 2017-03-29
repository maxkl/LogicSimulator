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
