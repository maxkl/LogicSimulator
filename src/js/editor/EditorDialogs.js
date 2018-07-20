/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'lib/EventEmitter',
	'lib/extend'
], function (EventEmitter, extend) {
	var EXAMPLES_PATH = 'examples/';

	function EditorDialogs(app) {
		EventEmitter.call(this);

		this.app = app;

		this.$overlay = document.getElementById('overlay');

		this.$dialogOpen = document.getElementById('dialog-open');
		this.$dialogOpenExample = document.getElementById('dialog-open-example');
		this.$dialogOpenFile = document.getElementById('dialog-open-file');
		this.$dialogOpenError = document.getElementById('dialog-open-error');
		this.$dialogOpenLoading = document.getElementById('dialog-open-loading');
		this.$dialogOpenOpen = document.getElementById('dialog-open-open');
		this.$dialogOpenCancel = document.getElementById('dialog-open-cancel');

		this.$dialogNew = document.getElementById('dialog-new');
		this.$dialogNewNew = document.getElementById('dialog-new-new');
		this.$dialogNewCancel = document.getElementById('dialog-new-cancel');

		this.$dialogWelcome = document.getElementById('dialog-welcome');
		this.$dialogWelcomeShowAgain = document.getElementById('dialog-welcome-show-again');
		this.$dialogWelcomeClose = document.getElementById('dialog-welcome-close');

		this.$dialogNewCircuit = document.getElementById('dialog-new-circuit');
		this.$dialogNewCircuitName = document.getElementById('dialog-new-circuit-name');
		this.$dialogNewCircuitLabel = document.getElementById('dialog-new-circuit-label');
		this.$dialogNewCircuitMoveSelection = document.getElementById('dialog-new-circuit-move-selection');
		this.$dialogNewCircuitError = document.getElementById('dialog-new-circuit-error');
		this.$dialogNewCircuitCreate = document.getElementById('dialog-new-circuit-create');
		this.$dialogNewCircuitCancel = document.getElementById('dialog-new-circuit-cancel');

		this.$dialogEditCircuit = document.getElementById('dialog-edit-circuit');
		this.$dialogEditCircuitTitle = document.getElementById('dialog-edit-circuit-title');
		this.$dialogEditCircuitName = document.getElementById('dialog-edit-circuit-name');
		this.$dialogEditCircuitLabel = document.getElementById('dialog-edit-circuit-label');
		this.$dialogEditCircuitError = document.getElementById('dialog-edit-circuit-error');
		this.$dialogEditCircuitSave = document.getElementById('dialog-edit-circuit-save');
		this.$dialogEditCircuitDelete = document.getElementById('dialog-edit-circuit-delete');
		this.$dialogEditCircuitCancel = document.getElementById('dialog-edit-circuit-cancel');

		this.$dialogChooseCustomComponent = document.getElementById('dialog-choose-custom-component');
		this.$dialogChooseCustomComponentName = document.getElementById('dialog-choose-custom-component-name');
		this.$dialogChooseCustomComponentError = document.getElementById('dialog-choose-custom-component-error');
		this.$dialogChooseCustomComponentOK = document.getElementById('dialog-choose-custom-component-ok');
		this.$dialogChooseCustomComponentCancel = document.getElementById('dialog-choose-custom-component-cancel');

		this.dialogs = {
			'open': this.$dialogOpen,
			'new': this.$dialogNew,
			'welcome': this.$dialogWelcome,
			'new-circuit': this.$dialogNewCircuit,
			'edit-circuit': this.$dialogEditCircuit,
			'choose-custom-component': this.$dialogChooseCustomComponent
		};

		this.registerListeners();
	}

	extend(EditorDialogs, EventEmitter);

	EditorDialogs.prototype.registerListeners = function () {
		var self = this;

		this.$dialogOpenFile.addEventListener('change', function () {
			if (self.$dialogOpenFile.files.length > 0) {
				self.$dialogOpenError.classList.add('display-none');
			}
		});

		this.$dialogOpenFile.addEventListener('click', function () {
			document.querySelector('input[name=dialog-open-type][value=file]').checked = true;
		});

		this.$dialogOpenExample.addEventListener('click', function () {
			document.querySelector('input[name=dialog-open-type][value=example]').checked = true;
		});

		this.$dialogOpenOpen.addEventListener('click', function () {
			var selectedType = document.querySelector('input[name=dialog-open-type]:checked').value;

			if (selectedType === 'example') {
				var filename = self.$dialogOpenExample.value;
				var url = self.app.baseUrl + EXAMPLES_PATH + filename;
				self.emit('load-url', url);
			} else if (selectedType === 'file') {
				if (self.$dialogOpenFile.files.length > 0) {
					var file = self.$dialogOpenFile.files[0];
					self.emit('load-file', file);
				} else {
					self.displayOpenError('Please select a file');
				}
			}
		});

		this.$dialogOpenCancel.addEventListener('click', function () {
			self.close();
		});

		this.$dialogNewNew.addEventListener('click', function () {
			self.emit('new');
		});

		this.$dialogNewCancel.addEventListener('click', function () {
			self.close();
		});

		this.$dialogWelcomeClose.addEventListener('click', function () {
			self.close();
			self.emit('welcome-closed', self.$dialogWelcomeShowAgain.checked);
		});

		this.$dialogNewCircuitCreate.addEventListener('click', function () {
			var name = self.$dialogNewCircuitName.value;
			var label = self.$dialogNewCircuitLabel.value;
			var moveSelection = self.$dialogNewCircuitMoveSelection.checked;
			self.emit('new-circuit', name, label, moveSelection);
		});

		this.$dialogNewCircuitCancel.addEventListener('click', function () {
			self.close();
		});

		this.$dialogEditCircuitSave.addEventListener('click', function () {
			var name = self.$dialogEditCircuitName.value;
			var label = self.$dialogEditCircuitLabel.value;
			self.emit('edit-circuit', name, label);
		});

		this.$dialogEditCircuitDelete.addEventListener('click', function () {
			self.emit('delete-circuit');
		});

		this.$dialogEditCircuitCancel.addEventListener('click', function () {
			self.close();
		});

		this.$dialogChooseCustomComponentName.addEventListener('change', function () {
			self.$dialogChooseCustomComponentError.classList.add('display-none');
		});

		this.$dialogChooseCustomComponentOK.addEventListener('click', function () {
			var selectedName = self.$dialogChooseCustomComponentName.value;

			self.emit('choose-custom-component-selected', selectedName);
		});

		this.$dialogChooseCustomComponentCancel.addEventListener('click', function () {
			self.close();
			self.emit('choose-custom-component-cancelled');
		});
	};

	EditorDialogs.prototype.displayOpenLoading = function (loading) {
		if (loading) {
			this.$dialogOpenLoading.classList.remove('display-none');
		} else {
			this.$dialogOpenLoading.classList.add('display-none');
		}
	};

	EditorDialogs.prototype.displayOpenError = function (msg) {
		this.$dialogOpenError.textContent = 'Error: ' + msg;
		this.$dialogOpenError.classList.remove('display-none');

		this.displayOpenLoading(false);
	};

	EditorDialogs.prototype.setWelcomeShowAgain = function (showAgain) {
		this.$dialogWelcomeShowAgain.checked = showAgain;
	};

	EditorDialogs.prototype.displayNewCircuitError = function (msg) {
		this.$dialogNewCircuitError.textContent = msg;
		this.$dialogNewCircuitError.classList.remove('display-none');
	};

	EditorDialogs.prototype.displayEditCircuitError = function (msg) {
		this.$dialogEditCircuitError.textContent = msg;
		this.$dialogEditCircuitError.classList.remove('display-none');
	};

	EditorDialogs.prototype.displayChooseCustomComponentError = function (msg) {
		this.$dialogChooseCustomComponentError.textContent = 'Error: ' + msg;
		this.$dialogChooseCustomComponentError.classList.remove('display-none');
	};

	EditorDialogs.prototype.open = function (dialogName, data) {
		for (var name in this.dialogs) {
			if (this.dialogs.hasOwnProperty(name)) {
				var $dialog = this.dialogs[name];
				if (name === dialogName) {
					$dialog.classList.add('visible');
				} else {
					$dialog.classList.remove('visible');
				}
			}
		}

		switch (dialogName) {
			case 'open':
				this.$dialogOpenError.classList.add('display-none');
				this.$dialogOpenLoading.classList.add('display-none');
				break;
			case 'new-circuit':
				this.$dialogNewCircuitName.value = '';
				this.$dialogNewCircuitLabel.value = '';
				this.$dialogNewCircuitMoveSelection.checked = data;
				this.$dialogNewCircuitError.classList.add('display-none');
				break;
			case 'edit-circuit':
				this.$dialogEditCircuitTitle.textContent = data.name;
				this.$dialogEditCircuitName.value = data.name;
				this.$dialogEditCircuitLabel.value = data.label;
				this.$dialogEditCircuitError.classList.add('display-none');
				break;
			case 'choose-custom-component':
				this.$dialogChooseCustomComponentError.classList.add('display-none');

				var circuitNames = data.circuitNames;

				var selected = this.$dialogChooseCustomComponentName.value;
				this.$dialogChooseCustomComponentName.innerHTML = '';

				var selectedStillExists = false;

				for (var i = 0; i < circuitNames.length; i++) {
					var circuitName = circuitNames[i];

					if (circuitName.key === selected) {
						selectedStillExists = true;
					}

					var $opt = document.createElement('option');
					$opt.value = circuitName.key;
					$opt.textContent = circuitName.pretty;
					this.$dialogChooseCustomComponentName.appendChild($opt);
				}

				if (selectedStillExists) {
					this.$dialogChooseCustomComponentName.value = selected;
				}

				break;
		}

		this.$overlay.classList.add('visible');
	};

	EditorDialogs.prototype.close = function () {
		this.$overlay.classList.remove('visible');
	};

	return EditorDialogs;
});
