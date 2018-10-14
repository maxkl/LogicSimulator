/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'shared/lib/extend'
], function (Component, ComponentProperties, displayComponent, extend) {
	function ConstComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'value', 'Value', 'bool', true, updateDisplay ]
		]);

		this.layout();
	}

	extend(ConstComponent, Component);

	ConstComponent.prototype._save = function (data) {
		data.value = this.properties.get('value');
	};

	ConstComponent.prototype._load = function (data) {
		this.properties.set('value', data.value);

		this._updateDisplay();
	};

	ConstComponent.prototype.layout = function () {
		var layout = displayComponent.layout([], ['']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	ConstComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	ConstComponent.prototype._updateDisplay = function () {
		if(!this.$container) return;

		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, this.properties.get('value') ? '1' : '0');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	ConstComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	ConstComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	ConstComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'const',
			properties: [ this.properties.get('value') ]
		};
	};

	ConstComponent.typeName = 'const';
	ConstComponent.sidebarEntry = {
		name: 'Constant',
		category: 'Basic',
		drawPreview: function (svg) {
			var layout = displayComponent.layout([], ['']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '1');
		}
	};

	return ConstComponent;
});
