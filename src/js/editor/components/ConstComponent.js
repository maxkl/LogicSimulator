/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/ConstComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimConstComponent, extend) {
	function ConstComponent() {
		Component.call(this);

		this.connectionPoints = [
			{
				out: true,
				x: 6,
				y: 3,
				name: 'Q',
				index: 0
			}
		];

		this.$container = null;
		this.$rect = null;
		this.mousedownCallback = null;

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'value', 'Value', 'bool', true, updateDisplay ]
		]);
	}

	extend(ConstComponent, Component);

	ConstComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	ConstComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, [], ['Q'], this.properties.get('value') ? '1' : '0');
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

	ConstComponent.prototype.constructSimComponent = function () {
		return new SimConstComponent(this.properties.get('value'));
	};

	ConstComponent.sidebarEntry = {
		name: 'Constant',
		category: 'Basic',
		drawPreview: function (svg) {
			displayComponent(svg, [], ['Q'], '1');
		}
	};

	return ConstComponent;
});
