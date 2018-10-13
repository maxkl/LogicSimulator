/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/DEMUXComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimDEMUXComponent, extend) {
	var COMPONENT_LABEL = 'DEMUX';
	var COMPONENT_WIDTH = 9;

	function DEMUXComponent() {
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

	extend(DEMUXComponent, Component);

	DEMUXComponent.prototype._save = function (data) {
		data.inputs = this.properties.get('selectlines');
	};

	DEMUXComponent.prototype._load = function (data) {
		this.properties.set('selectlines', data.inputs);

		this.layout();
	};

	DEMUXComponent.prototype.layout = function () {
		var selectLines = Math.max(1, Math.min(this.properties.get('selectlines'), 8));
		var dataLines = Math.pow(2, selectLines);
		var inputs = [];
		for(var i = 0; i < selectLines; i++) {
			inputs.push('S' + i);
		}
		inputs.push(null);
		inputs.push('D');
		var outputs = [];
		for(var i = 0; i < dataLines; i++) {
			outputs.push('Q' + i);
		}
		var layout = displayComponent.layout(inputs, outputs, COMPONENT_WIDTH);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	DEMUXComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	DEMUXComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, COMPONENT_LABEL);
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	DEMUXComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	DEMUXComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	DEMUXComponent.prototype.constructSimComponent = function () {
		return new SimDEMUXComponent(this.properties.get('selectlines'));
	};

	DEMUXComponent.typeName = 'demux';
	DEMUXComponent.sidebarEntry = {
		name: 'DEMUX',
		category: 'Multiplexer',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['S0', 'S1', null, 'D'], ['Q0', 'Q1', 'Q2', 'Q3'], COMPONENT_WIDTH);
			displayComponent(svg, layout.width, layout.height, layout.pins, COMPONENT_LABEL);
		}
	};

	return DEMUXComponent;
});
