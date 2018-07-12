/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil'
], function (SvgUtil) {
	var PINS_PADDING = 1;
	var PINS_SPACING = 2;
	var MIN_HEIGHT = 4;

	function layout(inputs, outputs, width) {
		var inputCount = inputs.length;
		var outputCount = outputs.length;

		var maxPins = Math.max(inputCount, outputCount);

		var width = width || 5;
		var height = (maxPins - 1) * PINS_SPACING + 2 * PINS_PADDING;
		if(height < MIN_HEIGHT) height = MIN_HEIGHT;

		var inputsStartY = height / 2 - ((inputCount - 1) * PINS_SPACING) / 2;
		var outputsStartY = height / 2 - ((outputCount - 1) * PINS_SPACING) / 2;

		var pins = [];

		var indexOffset = 0;
		for(var i = 0; i < inputCount; i++) {
			var label = inputs[i];
			if (label === null) {
				indexOffset++;
			} else {
				var inverted = label[0] === '!';
				pins.push({
					out: false,
					x: -1,
					y: inputsStartY + i * PINS_SPACING,
					inverted: inverted,
					label: inverted ? label.substr(1) : label,
					index: i - indexOffset
				});
			}
		}

		var indexOffset = 0;
		for(var i = 0; i < outputCount; i++) {
			var label = outputs[i];
			if (label === null) {
				indexOffset++;
			} else {
				var inverted = label[0] === '!';
				pins.push({
					out: true,
					x: width + 1,
					y: outputsStartY + i * PINS_SPACING,
					inverted: inverted,
					label: inverted ? label.substr(1) : label,
					index: i - indexOffset
				});
			}
		}

		return {
			pins: pins,
			width: width,
			height: height
		};
	}

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

	function createPinLabel(x1, y1, x2, y2, label, inverted) {
		var pinLenX = x2 - x1;
		var pinLenY = y2 - y1;
		var pinLen = Math.sqrt(pinLenX * pinLenX + pinLenY * pinLenY);
		var x = x1 - (label.length * 7) * (pinLenX / pinLen);
		var y = y1 - 12 * (pinLenY / pinLen);
		var $label = SvgUtil.createElement('text');
		$label.setAttribute('x', x);
		$label.setAttribute('y', y + 4);
		$label.setAttribute('text-anchor', 'middle');
		$label.setAttribute('font-size', '14');
		$label.setAttribute('font-family', 'Source Code Pro');
		if(inverted) {
			$label.setAttribute('text-decoration', 'overline');
		}
		$label.setAttribute('pointer-events', 'none');
		$label.appendChild(document.createTextNode(label));
		return $label;
	}

	function displayComponent($container, width, height, pins, label) {
		var $rect = SvgUtil.createElement('rect');
		$rect.setAttribute('width', width * 10);
		$rect.setAttribute('height', height * 10);
		$rect.setAttribute('fill', 'white');
		$rect.setAttribute('stroke', 'black');
		$rect.setAttribute('stroke-width', '2');
		$container.appendChild($rect);

		for(var i = 0; i < pins.length; i++) {
			var pin = pins[i];

			var y = pin.y * 1;
			var x2 = pin.x;
			var x1 = pin.out ? x2 - 1 : x2 + 1;

			var $pin = createPin(x1 * 10, y * 10, x2 * 10, y * 10);
			$container.appendChild($pin);

			if(pin.inverted) {
				$container.appendChild(createInvCircle(x1 * 10, y * 10, x2 * 10, y * 10));
			}

			if(pin.label) {
				var $pinLabel = createPinLabel(x1 * 10, y * 10, x2 * 10, y * 10, pin.label, pin.inverted);
				$container.appendChild($pinLabel);
			}
		}

		var $label = SvgUtil.createElement('text');
		$label.setAttribute('x', (width * 10) / 2);
		$label.setAttribute('y', '27');
		$label.setAttribute('text-anchor', 'middle');
		$label.setAttribute('font-size', '20');
		$label.setAttribute('font-family', 'Source Code Pro');
		$label.setAttribute('pointer-events', 'none');
		$label.appendChild(document.createTextNode(label));
		$container.appendChild($label);

		return $rect;
	}

	displayComponent.layout = layout;

	return displayComponent;
});
