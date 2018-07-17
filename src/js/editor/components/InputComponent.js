/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, extend) {
	function InputComponent() {
		Component.call(this);

		this.isInput = true;

		this.pins = null;

		this.$container = null;
		this.$rect = null;

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'label', 'Label', 'string', 'A', updateDisplay ]
		]);

		this.layout();
	}

	extend(InputComponent, Component);

	InputComponent.prototype._save = function (data) {
		data.label = this.properties.get('label');
	};

	InputComponent.prototype._load = function (data) {
		this.properties.set('label', data.label);

		this._updateDisplay();
	};

	InputComponent.prototype.layout = function () {
		var layout = displayComponent.layout([], ['']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	InputComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	InputComponent.prototype._updateDisplay = function () {
		if(!this.$container) return;

		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, this.properties.get('label'));
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	InputComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	InputComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	InputComponent.prototype.getLabel = function () {
		return this.properties.get('label');
	};

	InputComponent.prototype.constructSimComponent = function () {
		return null;
	};

	InputComponent.typeName = 'input';
	InputComponent.sidebarEntry = {
		name: 'Input',
		category: 'Custom components',
		drawPreview: function (svg) {
			var layout = displayComponent.layout([], ['']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'A');
		}
	};

	return InputComponent;
});
