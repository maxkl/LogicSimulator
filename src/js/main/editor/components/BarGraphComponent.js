/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'shared/lib/extend',
	'lib/SvgUtil'
], function (Component, ComponentProperties, extend, SvgUtil) {
	var WIDTH = 5;

	var DEFAULT_SIZE = 4;
	var DEFAULT_OFF_COLOR = '#888';
	var DEFAULT_ON_COLOR = '#e00';

	function layoutBarGraphComponent(size) {
		var height = size * 2;

		var pins = [];

		for (var i = 0; i < size; i++) {
			pins.push({
				out: false,
				x: -1,
				y: i * 2 + 1,
				inverted: false,
				label: '',
				index: i
			});
		}

		return {
			height: height,
			pins: pins
		};
	}

	function displayBarGraphComponent($container, size, color) {
		var height = size * 2;

		var $rect = SvgUtil.createElement('rect');
		$rect.setAttribute('width', WIDTH * 10);
		$rect.setAttribute('height', height * 10);
		$rect.setAttribute('fill', 'white');
		$rect.setAttribute('stroke', 'black');
		$rect.setAttribute('stroke-width', '2');
		$container.appendChild($rect);

		for (var i = 0; i < size; i++) {
			var y = i * 2 + 1;
			var $pin = SvgUtil.createElement('line');
			$pin.setAttribute('x1', -1 * 10);
			$pin.setAttribute('y1', y * 10);
			$pin.setAttribute('x2', 0 * 10);
			$pin.setAttribute('y2', y * 10);
			$pin.setAttribute('stroke', 'black');
			$pin.setAttribute('stroke-width', '2');
			$container.appendChild($pin);
		}

		var $lights = [];

		for (var i = 0; i < size; i++) {
			var $light = SvgUtil.createElement('rect');
			$light.setAttribute('x', 1);
			$light.setAttribute('y', (i * 2) * 10 + 1);
			$light.setAttribute('width', WIDTH * 10 - 2);
			$light.setAttribute('height', 2 * 10 - 2);
			$light.setAttribute('fill', color);
			$light.setAttribute('pointer-events', 'none');
			$container.appendChild($light);
			$lights.push($light);
		}

		return {
			$rect: $rect,
			$lights: $lights
		};
	}

	function BarGraphComponent() {
		Component.call(this);

		this.width = WIDTH;
		this.height = 0;
		this.pins = null;

		this.$container = null;
		this.$rect = null;
		this.$lights = null;

		this.size = 1;
		this.offColor = null;
		this.onColor = null;

		var self = this;
		function updateDisplay() {
			self.layout();
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'size', 'Size', 'int', DEFAULT_SIZE, updateDisplay, { min: 1 } ],
			[ 'off-color', 'Color (Off)', 'string', DEFAULT_OFF_COLOR, updateDisplay ],
			[ 'on-color', 'Color (On)', 'string', DEFAULT_ON_COLOR, updateDisplay ]
		]);

		this.layout();
	}

	extend(BarGraphComponent, Component);

	BarGraphComponent.prototype._save = function (data) {
		data.size = this.properties.get('size');
		data.offColor = this.properties.get('off-color');
		data.onColor = this.properties.get('on-color');
	};

	BarGraphComponent.prototype._load = function (data) {
		this.properties.set('size', data.size);
		this.properties.set('off-color', data.offColor);
		this.properties.set('on-color', data.onColor);

		this.layout();
	};

	BarGraphComponent.prototype.layout = function () {
		this.size = this.properties.get('size');
		this.offColor = this.properties.get('off-color');
		this.onColor = this.properties.get('on-color');

		var layout = layoutBarGraphComponent(this.size);
		this.height = layout.height;
		this.pins = layout.pins;
	};

	BarGraphComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	BarGraphComponent.prototype._updateDisplay = function () {
		if(!this.$container) return;

		this.$container.innerHTML = '';
		var elements = displayBarGraphComponent(this.$container, this.size, this.offColor);
		this.$lights = elements.$lights;
		this.$rect = elements.$rect;
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	BarGraphComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	BarGraphComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	BarGraphComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'bargraph',
			args: [ this.properties.get('size') ]
		};
	};

	BarGraphComponent.prototype.updateSimulationDisplay = function (displayData) {
		for (var i = 0; i < this.size; i++) {
			if (displayData[i]) {
				this.$lights[i].setAttribute('fill', this.onColor);
			} else {
				this.$lights[i].setAttribute('fill', this.offColor);
			}
		}
	};

	BarGraphComponent.prototype.resetSimulationDisplay = function () {
		for (var i = 0; i < this.size; i++) {
			this.$lights[i].setAttribute('fill', this.offColor);
		}
	};

	BarGraphComponent.typeName = 'bargraph';
	BarGraphComponent.sidebarEntry = {
		name: 'Bar Graph',
		category: 'Input/Output',
		drawPreview: function (svg) {
			displayBarGraphComponent(svg, DEFAULT_SIZE, DEFAULT_ON_COLOR);
		}
	};

	return BarGraphComponent;
});
