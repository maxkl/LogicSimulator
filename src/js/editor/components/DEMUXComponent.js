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
	function DEMUXComponent() {
		Component.call(this);

		this.pins = null;

		this.width = 0;
		this.height = 0;
		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		var self = this;
		function updateLayout() {
			self.layout();
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'selectlines', 'Select lines', 'int', 1, updateLayout, { min: 1, max: 8 } ]
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
		inputs.push('D');
		var outputs = [];
		for(var i = 0; i < dataLines; i++) {
			outputs.push('Q' + i);
		}
		var layout = displayComponent.layout(inputs, outputs);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	DEMUXComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	DEMUXComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, 'DEMUX');
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
			var layout = displayComponent.layout(['S0', 'D'], ['Q0', 'Q1']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'DEMUX');
		}
	};

	return DEMUXComponent;
});
