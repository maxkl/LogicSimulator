/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil',
	'lib/EventEmitter',
	'lib/extend',
	'generated/editorComponents'
], function (SvgUtil, EventEmitter, extend, editorComponents) {
	function Sidebar(app) {
		EventEmitter.call(this);

		this.app = app;

		this.$wrapper = document.getElementById('sidebar-wrapper');
		this.$sidebar = document.getElementById('sidebar');

		this.registerListeners();

		var self = this;
		require(editorComponents, function () {
			self.loadComponents(Array.prototype.slice.call(arguments));
		});
	}

	extend(Sidebar, EventEmitter);

	Sidebar.prototype.loadComponents = function (components) {
		var self = this;

		var categories = {};

		for(var i = 0; i < components.length; i++) {
			var component = components[i];
			if(component.sidebarEntry) {
				var entry = component.sidebarEntry;

				var name = entry.name;
				var category = entry.category;
				var drawPreview = entry.drawPreview;

				if(!categories[category]) {
					categories[category] = [];
				}
				categories[category].push({
					name: name,
					category: category,
					ctor: component,
					drawPreview: drawPreview
				});
			}
		}

		for(var category in categories) {
			if(categories.hasOwnProperty(category)) {
				var section = document.createElement('div');
				section.className = 'section';
				this.$sidebar.appendChild(section);

				var title = document.createElement('div');
				title.className = 'section-title';
				title.textContent = category;
				section.appendChild(title);

				var comps = document.createElement('div');
				comps.className = 'components';
				section.appendChild(comps);

				var entries = categories[category];
				for(var i = 0; i < entries.length; i++) {
					var entry = entries[i];

					var comp = document.createElement('div');
					comp.className = 'component';
					comps.appendChild(comp);

					var prev = document.createElement('div');
					prev.className = 'component-preview';
					comp.appendChild(prev);

					if(entry.drawPreview) {
						var svg = SvgUtil.createSvg();
						svg.setAttribute('width', '100%');
						svg.setAttribute('height', '100%');
						prev.appendChild(svg);

						entry.drawPreview(svg);

						var b = svg.getBBox();
						var margin = 5;
						var viewBox = [
							b.x - margin,
							b.y - margin,
							b.width + margin * 2,
							b.height + margin * 2
						].join(' ');
						svg.setAttribute('viewBox', viewBox);
					}


					var name = document.createElement('div');
					name.className = 'component-name';
					name.textContent = entry.name;
					comp.appendChild(name);

					(function (entry) {
						prev.addEventListener('mousedown', function (evt) {
							self.emit('component-mousedown', evt, entry);
						});
					})(entry);
				}
			}
		}
	};

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
