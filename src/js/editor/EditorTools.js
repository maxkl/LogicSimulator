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
		this.simulationActive = false;
		this.simulationRunning = false;

		this.$run = document.getElementById('toolbar-run');
		this.$step = document.getElementById('toolbar-step');
		this.$stop = document.getElementById('toolbar-stop');
		this.$pause = document.getElementById('toolbar-pause');
		this.$toolSelect = document.getElementById('toolbar-tool-select');
		this.$toolConnect = document.getElementById('toolbar-tool-connect');
		this.$toolPan = document.getElementById('toolbar-tool-pan');
		this.$actionDelete = document.getElementById('toolbar-action-delete');
		this.$saveFile = document.getElementById('toolbar-file-save');
		this.$loadFile = document.getElementById('toolbar-file-load');

		this.registerListeners();
	}

	extend(EditorTools, EventEmitter);

	EditorTools.prototype.registerListeners = function () {
		var self = this;

		this.$run.addEventListener('click', function () {
			self.startSimulation();
		});

		this.$stop.addEventListener('click', function () {
			self.stopSimulation();
		});

		this.$step.addEventListener('click', function () {
			self.stepSimulation();
		});

		this.$pause.addEventListener('click', function () {
			self.pauseSimulation();
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

		this.$saveFile.addEventListener('click', function () {
			self.emit('save-file');
		});

		this.$loadFile.addEventListener('click', function () {
			self.emit('load-file');
		});
	};

	EditorTools.prototype.startSimulation = function () {
		this.simulationActive = true;

		if(this.simulationRunning) {
			this.$run.disabled = true;
			this.$step.disabled = true;
			this.$pause.disabled = false;

			this.emit('resume');
		} else {
			this.simulationRunning = true;

			this.$run.disabled = true;
			this.$step.disabled = true;
			this.$stop.disabled = false;
			this.$pause.disabled = false;

			this.$toolSelect.disabled = true;
			this.$toolConnect.disabled = true;
			this.$toolPan.disabled = true;
			this.$actionDelete.disabled = true;

			this.emit('run');
		}
	};

	EditorTools.prototype.stopSimulation = function () {
		if(!this.simulationActive) {
			return;
		}

		this.simulationActive = false;
		this.simulationRunning = false;

		this.$run.disabled = false;
		this.$step.disabled = true;
		this.$pause.disabled = true;
		this.$stop.disabled = true;

		this.$toolSelect.disabled = false;
		this.$toolConnect.disabled = false;
		this.$toolPan.disabled = false;
		this.$actionDelete.disabled = false;

		this.emit('stop');
	};

	EditorTools.prototype.stepSimulation = function () {
		this.emit('step');
	};

	EditorTools.prototype.pauseSimulation = function () {
		this.$run.disabled = false;
		this.$step.disabled = false;
		this.$pause.disabled = true;

		this.emit('pause');
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
