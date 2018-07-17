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
	function OutputComponent() {
		Component.call(this);

		this.isOutput = true;

		this.pins = null;

		this.$container = null;
		this.$rect = null;

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'label', 'Label', 'string', 'Q', updateDisplay ]
		]);

		this.layout();
	}

	extend(OutputComponent, Component);

	OutputComponent.prototype._save = function (data) {
		data.label = this.properties.get('label');
	};

	OutputComponent.prototype._load = function (data) {
		this.properties.set('label', data.label);

		this._updateDisplay();
	};

	OutputComponent.prototype.layout = function () {
		var layout = displayComponent.layout([''], []);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	OutputComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	OutputComponent.prototype._updateDisplay = function () {
		if(!this.$container) return;

		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, this.properties.get('label'));
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	OutputComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	OutputComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	OutputComponent.prototype.getLabel = function () {
		return this.properties.get('label');
	};

	OutputComponent.prototype.constructSimComponent = function () {
		return null;
	};

	OutputComponent.typeName = 'output';
	OutputComponent.sidebarEntry = {
		name: 'Output',
		category: 'Custom components',
		drawPreview: function (svg) {
			var layout = displayComponent.layout([''], []);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'Q');
		}
	};

	return OutputComponent;
});
