/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/AndComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimAndComponent, extend) {
	function AndComponent() {
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
			[ 'inputs', 'Input count', 'int', 2, updateLayout, { min: 2 } ]
		]);

		this.layout();
	}

	extend(AndComponent, Component);

	AndComponent.prototype._save = function (data) {
		data.inputs = this.properties.get('inputs');
	};

	AndComponent.prototype._load = function (data) {
		this.properties.set('inputs', data.inputs);

		this.layout();
	};

	AndComponent.prototype.layout = function () {
		var inputCount = Math.max(2, this.properties.get('inputs'));
		var inputs = [];
		for(var i = 0; i < inputCount; i++) {
			inputs.push('');
		}
		var layout = displayComponent.layout(inputs, ['']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	AndComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	AndComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, '&');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	AndComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	AndComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	AndComponent.prototype.constructSimComponent = function () {
		return new SimAndComponent(this.properties.get('inputs'));
	};

	AndComponent.typeName = 'and';
	AndComponent.sidebarEntry = {
		name: 'AND',
		category: 'Gates',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['', ''], ['']);
			displayComponent(svg, layout.width, layout.height, layout.pins, '&');
		}
	};

	return AndComponent;
});
