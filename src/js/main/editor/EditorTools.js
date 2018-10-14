/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'shared/lib/EventEmitter',
	'shared/lib/extend'
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
		this.$newFile = document.getElementById('toolbar-file-new');
		this.$saveFile = document.getElementById('toolbar-file-save');
		this.$loadFile = document.getElementById('toolbar-file-load');
		this.$showHelp = document.getElementById('toolbar-help');
		this.$newCircuit = document.getElementById('toolbar-circuit-new');
		this.$selectCircuit = document.getElementById('toolbar-circuit-select');
		this.$editCircuit = document.getElementById('toolbar-circuit-edit');

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

		this.$newFile.addEventListener('click', function () {
			self.emit('new-file');
		});

		this.$saveFile.addEventListener('click', function () {
			self.emit('save-file');
		});

		this.$loadFile.addEventListener('click', function () {
			self.emit('load-file');
		});

		this.$showHelp.addEventListener('click', function () {
			self.emit('show-help');
		});

		this.$newCircuit.addEventListener('click', function () {
			self.emit('new-circuit');
		});

		this.$selectCircuit.addEventListener('change', function () {
			var circuitName = self.$selectCircuit.value;
			self.$editCircuit.disabled = circuitName === 'main';
			self.emit('select-circuit', circuitName);
		});

		this.$editCircuit.addEventListener('click', function () {
			self.emit('edit-circuit');
		});
	};

	EditorTools.prototype.startSimulation = function () {
		if (!this.simulationActive) {
			this.emit('pre-run');
		}

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
			this.$newCircuit.disabled = true;
			this.$selectCircuit.disabled = true;

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
		this.$newCircuit.disabled = false;
		this.$selectCircuit.disabled = false;

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

	EditorTools.prototype.updateCircuitsList = function (circuitNames, selectedCircuit) {
		this.$selectCircuit.innerHTML = '';

		for (var i = 0; i < circuitNames.length; i++) {
			var circuitName = circuitNames[i];

			var $opt = document.createElement('option');
			$opt.value = circuitName.key;
			$opt.textContent = circuitName.pretty;
			this.$selectCircuit.appendChild($opt);
		}

		this.selectCircuit(selectedCircuit);
	};

	EditorTools.prototype.selectCircuit = function (circuitName) {
		this.$selectCircuit.value = circuitName;
		this.$editCircuit.disabled = circuitName === 'main';
	};

	EditorTools.TOOL_SELECT = TOOL_SELECT;
	EditorTools.TOOL_CONNECT = TOOL_CONNECT;
	EditorTools.TOOL_PAN = TOOL_PAN;

	return EditorTools;
});
