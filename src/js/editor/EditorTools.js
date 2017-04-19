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
		this.$toolSelect = document.getElementById('toolbar-tool-select');
		this.$toolConnect = document.getElementById('toolbar-tool-connect');
		this.$toolPan = document.getElementById('toolbar-tool-pan');
		this.$actionDelete = document.getElementById('toolbar-action-delete');

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

				self.$toolSelect.disabled = true;
				self.$toolConnect.disabled = true;
				self.$toolPan.disabled = true;
				self.$actionDelete.disabled = true;

				self.emit('run');
			}
		});

		this.$stop.addEventListener('click', function () {
			self.running = false;

			self.$run.disabled = false;
			self.$pause.disabled = true;
			self.$stop.disabled = true;

			self.$toolSelect.disabled = false;
			self.$toolConnect.disabled = false;
			self.$toolPan.disabled = false;
			self.$actionDelete.disabled = false;

			self.emit('stop');
		});

		this.$pause.addEventListener('click', function () {
			self.$run.disabled = false;
			self.$pause.disabled = true;

			self.emit('pause');
		});

		this.$toolSelect.addEventListener('click', function (evt) {
			self.setTool(TOOL_SELECT);
		});

		this.$toolConnect.addEventListener('click', function (evt) {
			self.setTool(TOOL_CONNECT);
		});

		this.$toolPan.addEventListener('click', function (evt) {
			self.setTool(TOOL_PAN);
		});

		this.$actionDelete.addEventListener('click', function () {
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
