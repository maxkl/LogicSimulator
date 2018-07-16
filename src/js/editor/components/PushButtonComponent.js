/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'sim/components/PushButtonComponent',
	'lib/extend',
	'lib/SvgUtil'
], function (Component, ComponentProperties, SimPushButtonComponent, extend, SvgUtil) {
	var WIDTH = 5;
	var HEIGHT = 4;
	var RELEASED_COLOR = '#555';
	var PRESSED_COLOR = '#000';

	function displayPushButtonComponent($container, color) {
		var $rect = SvgUtil.createElement('rect');
		$rect.setAttribute('width', WIDTH * 10);
		$rect.setAttribute('height', HEIGHT * 10);
		$rect.setAttribute('fill', 'white');
		$rect.setAttribute('stroke', 'black');
		$rect.setAttribute('stroke-width', '2');
		$container.appendChild($rect);

		var $pin = SvgUtil.createElement('line');
		$pin.setAttribute('x1', 5 * 10);
		$pin.setAttribute('y1', 2 * 10);
		$pin.setAttribute('x2', 6 * 10);
		$pin.setAttribute('y2', 2 * 10);
		$pin.setAttribute('stroke', 'black');
		$pin.setAttribute('stroke-width', '2');
		$container.appendChild($pin);

		var $btn = SvgUtil.createElement('circle');
		$btn.setAttribute('cx', (WIDTH * 10) / 2);
		$btn.setAttribute('cy', (HEIGHT * 10) / 2);
		$btn.setAttribute('r', (Math.min(WIDTH, HEIGHT) * 10) / 2 - 6);
		$btn.setAttribute('fill', color);
		$btn.setAttribute('cursor', 'pointer');
		$btn.setAttribute('pointer-events', 'none');
		$container.appendChild($btn);

		return {
			$rect: $rect,
			$btn: $btn
		};
	}

	function PushButtonComponent() {
		Component.call(this);

		this.pins = [
			{
				out: true,
				x: 6,
				y: 2,
				inverted: false,
				label: '',
				index: 0
			}
		];

		this.$container = null;
		this.$rect = null;
		this.$btn = null;

		this.properties = new ComponentProperties([]);

		this.width = WIDTH;
		this.height = HEIGHT;

		this.simComponent = null;
	}

	extend(PushButtonComponent, Component);

	PushButtonComponent.prototype._save = function (data) {};

	PushButtonComponent.prototype._load = function (data) {};

	PushButtonComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	PushButtonComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		var elements = displayPushButtonComponent(this.$container, RELEASED_COLOR);
		this.$btn = elements.$btn;
		this.$rect = elements.$rect;
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		var self = this;
		this.$btn.addEventListener('mousedown', function (evt) {
			evt.stopPropagation();

			self.simComponent.pressed = true;
			self.$btn.setAttribute('fill', PRESSED_COLOR);
		});

		if(this.selected) {
			this._select();
		}
	};

	PushButtonComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	PushButtonComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	PushButtonComponent.prototype.constructSimComponent = function () {
		return new SimPushButtonComponent();
	};

	PushButtonComponent.prototype.initSimulationDisplay = function (simComponent) {
		this.simComponent = simComponent;

		this.$btn.setAttribute('pointer-events', 'visiblePainted');
	};

	PushButtonComponent.prototype.updateSimulationDisplay = function (simComponent) {
		this.$btn.setAttribute('fill', RELEASED_COLOR);
	};

	PushButtonComponent.prototype.resetSimulationDisplay = function () {
		this.$btn.setAttribute('pointer-events', 'none');
		this.$btn.setAttribute('fill', RELEASED_COLOR);
	};

	PushButtonComponent.typeName = 'pushbutton';
	PushButtonComponent.sidebarEntry = {
		name: 'Push button',
		category: 'Input/Output',
		drawPreview: function (svg) {
			displayPushButtonComponent(svg, RELEASED_COLOR);
		}
	};

	return PushButtonComponent;
});
