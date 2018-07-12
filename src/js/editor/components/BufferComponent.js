/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/BufferComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimBufferComponent, extend) {
	function BufferComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(BufferComponent, Component);

	BufferComponent.prototype._save = function (data) {};

	BufferComponent.prototype._load = function (data) {};

	BufferComponent.prototype.layout = function () {
		var layout = displayComponent.layout([''], ['']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	BufferComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	BufferComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, '1');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	BufferComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	BufferComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	BufferComponent.prototype.constructSimComponent = function () {
		return new SimBufferComponent();
	};

	BufferComponent.typeName = 'buffer';
	BufferComponent.sidebarEntry = {
		name: 'Buffer',
		category: 'Basic',
		drawPreview: function (svg) {
			var layout = displayComponent.layout([''], ['']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '1');
		}
	};

	return BufferComponent;
});
