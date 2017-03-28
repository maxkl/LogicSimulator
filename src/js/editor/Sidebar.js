/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/EventEmitter',
	'lib/extend'
], function (EventEmitter, extend) {
	function Sidebar(app) {
		EventEmitter.call(this);

		this.app = app;

		this.$wrapper = document.getElementById('sidebar-wrapper');

		this.registerListeners();
	}

	extend(Sidebar, EventEmitter);

	Sidebar.prototype.registerListeners = function () {
		var self = this;

		document.getElementById('sidebar-min-max').addEventListener('click', function () {
			self.$wrapper.classList.toggle('hidden');
		});
	};

	Sidebar.prototype.hide = function () {
		this.$wrapper.classList.add('hidden');
	};

	Sidebar.prototype.show = function () {
		this.$wrapper.classList.remove('hidden');
	};

	return Sidebar;
});
