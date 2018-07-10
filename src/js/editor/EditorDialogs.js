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

		this.dialogs = {
			'open': this.$dialogOpen,
			'new': this.$dialogNew,
			'welcome': this.$dialogWelcome
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

	EditorDialogs.prototype.open = function (dialogName) {
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
		}

		this.$overlay.classList.add('visible');
	};

	EditorDialogs.prototype.close = function () {
		this.$overlay.classList.remove('visible');
	};

	return EditorDialogs;
});
