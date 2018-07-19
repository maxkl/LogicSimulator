/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'lib/extend',
	'lib/SvgUtil'
], function (Component, ComponentProperties, displayComponent, extend, SvgUtil) {
	function displayInputComponent($container, label) {
		var $polygon = SvgUtil.createElement('polygon');
		$polygon.setAttribute('points', '0 0 50 0 60 10 50 20 0 20');
		$polygon.setAttribute('fill', 'white');
		$polygon.setAttribute('stroke', 'black');
		$polygon.setAttribute('stroke-width', '2');
		$container.appendChild($polygon);

		var $label = SvgUtil.createElement('text');
		$label.setAttribute('x', 25);
		$label.setAttribute('y', 15);
		$label.setAttribute('text-anchor', 'middle');
		$label.setAttribute('font-size', '16');
		$label.setAttribute('font-family', 'Source Code Pro');
		$label.setAttribute('pointer-events', 'none');
		$label.appendChild(document.createTextNode(label));
		$container.appendChild($label);

		return $polygon;
	}

	function InputComponent() {
		Component.call(this);

		this.isInput = true;

		this.width = 6;
		this.height = 2;
		this.pins = [
			{
				out: true,
				x: 6,
				y: 1,
				inverted: false,
				label: '',
				index: 0
			}
		];

		this.$container = null;
		this.$polygon = null;

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'label', 'Label', 'string', 'A', updateDisplay ]
		]);
	}

	extend(InputComponent, Component);

	InputComponent.prototype._save = function (data) {
		data.label = this.properties.get('label');
	};

	InputComponent.prototype._load = function (data) {
		this.properties.set('label', data.label);

		this._updateDisplay();
	};

	InputComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	InputComponent.prototype._updateDisplay = function () {
		if(!this.$container) return;

		this.$container.innerHTML = '';
		this.$polygon = displayInputComponent(this.$container, this.properties.get('label'));
		this.$polygon.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	InputComponent.prototype._select = function () {
		this.$polygon.setAttribute('stroke', '#0288d1');
	};

	InputComponent.prototype._deselect = function () {
		this.$polygon.setAttribute('stroke', '#000');
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
			displayInputComponent(svg, 'A');
		}
	};

	return InputComponent;
});
