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
	function DFlipFlopComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(DFlipFlopComponent, Component);

	DFlipFlopComponent.prototype._save = function (data) {};

	DFlipFlopComponent.prototype._load = function (data) {};

	DFlipFlopComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['D', null, '>C'], ['Q', null, '!Q']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	DFlipFlopComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	DFlipFlopComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, 'D');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	DFlipFlopComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	DFlipFlopComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	DFlipFlopComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'dflipflop'
		};
	};

	DFlipFlopComponent.typeName = 'dflipflop';
	DFlipFlopComponent.sidebarEntry = {
		name: 'D FF',
		category: 'Memory',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['D', null, '>C'], ['Q', null, '!Q']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'D');
		}
	};

	return DFlipFlopComponent;
});
