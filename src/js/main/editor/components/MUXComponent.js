/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'shared/lib/extend'
], function (Component, ComponentProperties, displayComponent, extend) {
	var COMPONENT_LABEL = 'MUX';
	var COMPONENT_WIDTH = 9;

	function MUXComponent() {
		Component.call(this);

		this.pins = null;

		this.width = 0;
		this.height = 0;
		this.pins = null;

		this.$container = null;
		this.$rect = null;

		var self = this;
		function updateLayout() {
			self.layout();
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'selectlines', 'Select lines', 'int', 2, updateLayout, { min: 1, max: 8 } ]
		]);

		this.layout();
	}

	extend(MUXComponent, Component);

	MUXComponent.prototype._save = function (data) {
		data.inputs = this.properties.get('selectlines');
	};

	MUXComponent.prototype._load = function (data) {
		this.properties.set('selectlines', data.inputs);

		this.layout();
	};

	MUXComponent.prototype.layout = function () {
		var selectLines = Math.max(1, Math.min(this.properties.get('selectlines'), 8));
		var dataLines = Math.pow(2, selectLines);
		var inputs = [];
		for(var i = 0; i < selectLines; i++) {
			inputs.push('S' + i);
		}
		inputs.push(null);
		for(var i = 0; i < dataLines; i++) {
			inputs.push('D' + i);
		}
		var layout = displayComponent.layout(inputs, ['Q'], COMPONENT_WIDTH);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	MUXComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	MUXComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, COMPONENT_LABEL);
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	MUXComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	MUXComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	MUXComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'mux',
			properties: [ this.properties.get('selectlines') ]
		};
	};

	MUXComponent.typeName = 'mux';
	MUXComponent.sidebarEntry = {
		name: 'MUX',
		category: 'Multiplexer',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['S0', 'S1', null, 'D0', 'D1', 'D2', 'D3'], ['Q'], COMPONENT_WIDTH);
			displayComponent(svg, layout.width, layout.height, layout.pins, COMPONENT_LABEL);
		}
	};

	return MUXComponent;
});
