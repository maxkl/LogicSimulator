/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/JKFlipFlopComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimJKFlipFlopComponent, extend) {
	function JKFlipFlopComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(JKFlipFlopComponent, Component);

	JKFlipFlopComponent.prototype._save = function (data) {};

	JKFlipFlopComponent.prototype._load = function (data) {};

	JKFlipFlopComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['J', 'C', 'K'], ['Q', '!Q']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	JKFlipFlopComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	JKFlipFlopComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, 'JK');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	JKFlipFlopComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	JKFlipFlopComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	JKFlipFlopComponent.prototype.constructSimComponent = function () {
		return new SimJKFlipFlopComponent();
	};

	JKFlipFlopComponent.typeName = 'jkflipflop';
	JKFlipFlopComponent.sidebarEntry = {
		name: 'JK FF',
		category: 'Memory',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['J', 'C', 'K'], ['Q', '!Q']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'JK');
		}
	};

	return JKFlipFlopComponent;
});
