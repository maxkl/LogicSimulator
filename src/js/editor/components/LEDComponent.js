/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'sim/components/LEDComponent',
	'lib/extend',
	'lib/SvgUtil'
], function (Component, ComponentProperties, SimLEDComponent, extend, SvgUtil) {
	var WIDTH = 5;
	var HEIGHT = 4;
	var DEFAULT_OFF_COLOR = '#888';
	var DEFAULT_ON_COLOR = '#e00';

	function displayLEDComponent($container, color) {
		var $rect = SvgUtil.createElement('rect');
		$rect.setAttribute('width', WIDTH * 10);
		$rect.setAttribute('height', HEIGHT * 10);
		$rect.setAttribute('fill', 'white');
		$rect.setAttribute('stroke', 'black');
		$rect.setAttribute('stroke-width', '2');
		$container.appendChild($rect);

		var $pin = SvgUtil.createElement('line');
		$pin.setAttribute('x1', -1 * 10);
		$pin.setAttribute('y1', 2 * 10);
		$pin.setAttribute('x2', 0 * 10);
		$pin.setAttribute('y2', 2 * 10);
		$pin.setAttribute('stroke', 'black');
		$pin.setAttribute('stroke-width', '2');
		$container.appendChild($pin);

		var $light = SvgUtil.createElement('circle');
		$light.setAttribute('cx', (WIDTH * 10) / 2);
		$light.setAttribute('cy', (HEIGHT * 10) / 2);
		$light.setAttribute('r', (Math.min(WIDTH, HEIGHT) * 10) / 2 - 6);
		$light.setAttribute('fill', color);
		$light.setAttribute('pointer-events', 'none');
		$container.appendChild($light);

		return {
			$rect: $rect,
			$light: $light
		};
	}

	function LEDComponent() {
		Component.call(this);

		this.pins = [
			{
				out: false,
				x: -1,
				y: 2,
				inverted: false,
				label: '',
				index: 0
			}
		];

		this.$container = null;
		this.$rect = null;
		this.$light = null;
		this.mousedownCallback = null;

		this.offColor = null;
		this.onColor = null;

		var self = this;
		function updateDisplay() {
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'off-color', 'Color (Off)', 'string', DEFAULT_OFF_COLOR, updateDisplay ],
			[ 'on-color', 'Color (On)', 'string', DEFAULT_ON_COLOR, updateDisplay ]
		]);

		this.width = WIDTH;
		this.height = HEIGHT;
	}

	extend(LEDComponent, Component);

	LEDComponent.prototype._save = function (data) {
		data.offColor = this.properties.get('off-color');
		data.onColor = this.properties.get('on-color');
	};

	LEDComponent.prototype._load = function (data) {
		this.properties.set('off-color', data.offColor);
		this.properties.set('on-color', data.onColor);

		this._updateDisplay();
	};

	LEDComponent.prototype._display = function ($c, mousedown) {
		this.$container = $c;
		this.mousedownCallback = mousedown;
		this._updateDisplay();
	};

	LEDComponent.prototype._updateDisplay = function () {
		this.offColor = this.properties.get('off-color');
		this.onColor = this.properties.get('on-color');

		this.$container.innerHTML = '';
		var elements = displayLEDComponent(this.$container, this.offColor);
		this.$light = elements.$light;
		this.$rect = elements.$rect;
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	LEDComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	LEDComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	LEDComponent.prototype.constructSimComponent = function () {
		return new SimLEDComponent();
	};

	LEDComponent.prototype.updateSimulationDisplay = function (simComponent) {
		if(simComponent.in[0]) {
			this.$light.setAttribute('fill', this.onColor);
		} else {
			this.$light.setAttribute('fill', this.offColor);
		}
	};

	LEDComponent.prototype.resetSimulationDisplay = function () {
		this.$light.setAttribute('fill', this.offColor);
	};

	LEDComponent.typeName = 'led';
	LEDComponent.sidebarEntry = {
		name: 'LED',
		category: 'Input/Output',
		drawPreview: function (svg) {
			displayLEDComponent(svg, DEFAULT_ON_COLOR);
		}
	};

	return LEDComponent;
});
