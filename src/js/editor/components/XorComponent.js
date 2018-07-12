/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/XorComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimXorComponent, extend) {
	function XorComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(XorComponent, Component);

	XorComponent.prototype._save = function (data) {};

	XorComponent.prototype._load = function (data) {};

	XorComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['', ''], ['']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	XorComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	XorComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, '=1');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	XorComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	XorComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	XorComponent.prototype.constructSimComponent = function () {
		return new SimXorComponent();
	};

	XorComponent.typeName = 'xor';
	XorComponent.sidebarEntry = {
		name: 'XOR',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['', ''], ['']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '=1');
		}
	};

	return XorComponent;
});
