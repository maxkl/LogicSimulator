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
	function displayOutputComponent($container, label) {
		var $polygon = SvgUtil.createElement('polygon');
		$polygon.setAttribute('points', '0 0 50 0 60 10 50 20 0 20');
		$polygon.setAttribute('fill', 'white');
		$polygon.setAttribute('stroke', 'black');
		$polygon.setAttribute('stroke-width', '2');
		$container.appendChild($polygon);

		var $pin = SvgUtil.createElement('line');
		$pin.setAttribute('x1', -10);
		$pin.setAttribute('y1', 10);
		$pin.setAttribute('x2', 0);
		$pin.setAttribute('y2', 10);
		$pin.setAttribute('stroke', 'black');
		$pin.setAttribute('stroke-width', '2');
		$container.appendChild($pin);

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

	function OutputComponent() {
		Component.call(this);

		this.isOutput = true;

		this.width = 6;
		this.height = 2;
		this.pins = [
			{
				out: false,
				x: -1,
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
			[ 'label', 'Label', 'string', 'Q', updateDisplay ]
		]);
	}

	extend(OutputComponent, Component);

	OutputComponent.prototype._save = function (data) {
		data.label = this.properties.get('label');
	};

	OutputComponent.prototype._load = function (data) {
		this.properties.set('label', data.label);

		this._updateDisplay();
	};

	OutputComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	OutputComponent.prototype._updateDisplay = function () {
		if(!this.$container) return;

		this.$container.innerHTML = '';
		this.$polygon = displayOutputComponent(this.$container, this.properties.get('label'));
		this.$polygon.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	OutputComponent.prototype._select = function () {
		this.$polygon.setAttribute('stroke', '#0288d1');
	};

	OutputComponent.prototype._deselect = function () {
		this.$polygon.setAttribute('stroke', '#000');
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
			displayOutputComponent(svg, 'Q');
		}
	};

	return OutputComponent;
});
