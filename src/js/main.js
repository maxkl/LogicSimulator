/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil',
	'App',
	'Component'
], function (SvgUtil, App, Component) {
	var app = new App();

	var PINS_PADDING = 30;
	var PINS_SPACING = 40;
	var INV_RADIUS = 3;
	var INV_STROKE_WIDTH = 2;

	function createPin(x1, y1, x2, y2) {
		var $line = SvgUtil.createElement('line');
		$line.setAttribute('x1', x1);
		$line.setAttribute('y1', y1);
		$line.setAttribute('x2', x2);
		$line.setAttribute('y2', y2);
		$line.setAttribute('stroke', 'black');
		$line.setAttribute('stroke-width', '2');
		return $line;
	}

	function createInvCircle(x1, y1, x2, y2) {
		var pinLenX = x2 - x1;
		var pinLenY = y2 - y1;
		var pinLen = Math.sqrt(pinLenX * pinLenX + pinLenY * pinLenY);
		var radius = INV_RADIUS + INV_STROKE_WIDTH / 2;
		var x = x1 + radius * (pinLenX / pinLen);
		var y = y1 + radius * (pinLenY / pinLen);
		var $inv = SvgUtil.createElement('circle');
		$inv.setAttribute('cx', x);
		$inv.setAttribute('cy', y);
		$inv.setAttribute('r', INV_RADIUS);
		$inv.setAttribute('fill', 'white');
		$inv.setAttribute('stroke', 'black');
		$inv.setAttribute('stroke-width', INV_STROKE_WIDTH);
		return $inv;
	}

	function createPinLabel(x1, y1, x2, y2, label) {
		var inverted = false;
		if(label[0] === '!') {
			inverted = true;
			label = label.substr(1);
		}

		var pinLenX = x2 - x1;
		var pinLenY = y2 - y1;
		var pinLen = Math.sqrt(pinLenX * pinLenX + pinLenY * pinLenY);
		var x = x1 - (label.length * 7) * (pinLenX / pinLen);
		var y = y1 - 12 * (pinLenY / pinLen);
		var $label = SvgUtil.createElement('text');
		$label.setAttribute('x', x);
		$label.setAttribute('y', y + 6);
		$label.setAttribute('text-anchor', 'middle');
		$label.setAttribute('font-size', '16');
		$label.setAttribute('font-family', 'Source Code Pro');
		if(inverted) {
			$label.setAttribute('text-decoration', 'overline');
		}
		$label.setAttribute('pointer-events', 'none');
		$label.appendChild(document.createTextNode(label));
		return $label;
	}

	function displayGenericComponent($container, inputs, outputs, label) {
		var inputCount = inputs.length;
		var outputCount = outputs.length;

		var maxPins = Math.max(inputCount, outputCount);

		var width = 50;
		var height = (maxPins - 1) * PINS_SPACING + 2 * PINS_PADDING;

		var inputsStartY = height / 2 - ((inputCount - 1) * PINS_SPACING) / 2;
		var outputsStartY = height / 2 - ((outputCount - 1) * PINS_SPACING) / 2;

		var $rect = SvgUtil.createElement('rect');
		$rect.setAttribute('width', width);
		$rect.setAttribute('height', height);
		$rect.setAttribute('fill', 'white');
		$rect.setAttribute('stroke', 'black');
		$rect.setAttribute('stroke-width', '2');
		$container.appendChild($rect);

		var i, y, $pin, $pinLabel;
		for(i = 0; i < inputCount; i++) {
			y = inputsStartY + i * PINS_SPACING;
			$pin = createPin(0, y, -10, y);
			$container.appendChild($pin);

			if(inputs[i][0] === '!') {
				$container.appendChild(createInvCircle(0, y, -10, y));
			}

			$pinLabel = createPinLabel(0, y, -10, y, inputs[i]);
			$container.appendChild($pinLabel);
		}
		for(i = 0; i < outputCount; i++) {
			y = outputsStartY + i * PINS_SPACING;
			$pin = createPin(width, y, width + 10, y);
			$container.appendChild($pin);

			if(outputs[i][0] === '!') {
				$container.appendChild(createInvCircle(width, y, width + 10, y));
			}

			$pinLabel = createPinLabel(width, y, width + 10, y, outputs[i]);
			$container.appendChild($pinLabel);
		}

		var $label = SvgUtil.createElement('text');
		$label.setAttribute('x', width / 2);
		$label.setAttribute('y', '30');
		$label.setAttribute('text-anchor', 'middle');
		$label.setAttribute('font-size', '25');
		$label.setAttribute('font-family', 'Source Code Pro');
		$label.setAttribute('pointer-events', 'none');
		$label.appendChild(document.createTextNode(label));
		$container.appendChild($label);
	}

	function and(inputs, outputs) {
		outputs[0] = inputs[0] && inputs[1];
	}

	function noop() {}

	var andc = new Component(2, 1, and, function ($container) {
		displayGenericComponent($container, ['A', 'B'], ['Q'], '&');
	});
	app.addComponent(andc, 100, 700);

	// 1-1
	app.addComponent(new Component(1, 1, noop, function ($c) {
		displayGenericComponent($c, ['A'], ['!Q'], '1');
	}), 100, 100);

	// 2-1
	app.addComponent(new Component(2, 1, noop, function ($c) {
		displayGenericComponent($c, ['A', 'B'], ['Q'], '&');
	}), 100, 300);
	// 2-2
	app.addComponent(new Component(2, 2, noop, function ($c) {
		displayGenericComponent($c, ['A', 'B'], ['S', 'C'], 'HA');
	}), 200, 300);

	// 3-1
	app.addComponent(new Component(3, 1, noop, function ($c) {
		displayGenericComponent($c, ['A', 'B', 'C'], ['Q'], '≥1');
	}), 100, 500);

	// 3-2
	app.addComponent(new Component(3, 2, noop, function ($c) {
		displayGenericComponent($c, ['A', 'B', 'C'], ['S', 'C'], 'VA');
	}), 200, 500);
});
