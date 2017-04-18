/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/FullAdderComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimFullAdderComponent, extend) {
	function FullAdderComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(FullAdderComponent, Component);

	FullAdderComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['A', 'B', 'C'], ['S', 'C']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	FullAdderComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	FullAdderComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, 'FA');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	FullAdderComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	FullAdderComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	FullAdderComponent.prototype.constructSimComponent = function () {
		return new SimFullAdderComponent();
	};

	FullAdderComponent.sidebarEntry = {
		name: 'Full Adder',
		category: 'Adder',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['A', 'B', 'C'], ['S', 'C']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'FA');
		}
	};

	return FullAdderComponent;
});
