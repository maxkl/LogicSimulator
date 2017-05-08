/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/XnorComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimXnorComponent, extend) {
	function XnorComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(XnorComponent, Component);

	XnorComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['', ''], ['!']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	XnorComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	XnorComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, '=1');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	XnorComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	XnorComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	XnorComponent.prototype.constructSimComponent = function () {
		return new SimXnorComponent();
	};

	XnorComponent.sidebarEntry = {
		name: 'Xnor',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['', ''], ['!']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '=1');
		}
	};

	return XnorComponent;
});
