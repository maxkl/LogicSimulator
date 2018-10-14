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
	function XnorComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(XnorComponent, Component);

	XnorComponent.prototype._save = function (data) {};

	XnorComponent.prototype._load = function (data) {};

	XnorComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['', ''], ['!']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	XnorComponent.prototype._display = function ($c) {
		this.$container = $c;
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

	XnorComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'xnor'
		};
	};

	XnorComponent.typeName = 'xnor';
	XnorComponent.sidebarEntry = {
		name: 'XNOR',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['', ''], ['!']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '=1');
		}
	};

	return XnorComponent;
});
