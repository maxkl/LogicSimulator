/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/NotComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimNotComponent, extend) {
	function NotComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(NotComponent, Component);

	NotComponent.prototype.layout = function () {
		var layout = displayComponent.layout([''], ['!']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	NotComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
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

	NotComponent.prototype.constructSimComponent = function () {
		return new SimNotComponent();
	};

	NotComponent.sidebarEntry = {
		name: 'Not',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout([''], ['!']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '1');
		}
	};

	return NotComponent;
});
