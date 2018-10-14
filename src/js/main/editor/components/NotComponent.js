/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'shared/lib/extend'
], function (Component, ComponentProperties, displayComponent, extend) {
	function NotComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(NotComponent, Component);

	NotComponent.prototype._save = function (data) {};

	NotComponent.prototype._load = function (data) {};

	NotComponent.prototype.layout = function () {
		var layout = displayComponent.layout([''], ['!']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	NotComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	NotComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, '1');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	NotComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	NotComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	NotComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'not'
		};
	};

	NotComponent.typeName = 'not';
	NotComponent.sidebarEntry = {
		name: 'NOT',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout([''], ['!']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '1');
		}
	};

	return NotComponent;
});
