/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil'
], function (SvgUtil) {
	var RIGHT = 0;
	var DOWN = 1;
	var LEFT = 2;
	var UP = 3;

	var PINS_PADDING = 1;
	var PINS_SPACING = 2;
	var MIN_HEIGHT = 4;

	var rLabel = /^(>)?(!)?(.*)$/;

	function parseLabel(label) {
		var match = label.match(rLabel);

		if (match === null) {
			throw new Error('Invalid label format');
		}

		return {
			clock: !!match[1],
			inverted: !!match[2],
			label: match[3]
		};
	}

	function layout(inputs, outputs, width) {
		var inputCount = inputs.length;
		var outputCount = outputs.length;

		var maxPins = Math.max(inputCount, outputCount);

		var width = width || 5;
		var height = (maxPins - 1) * PINS_SPACING + 2 * PINS_PADDING;
		if (height < MIN_HEIGHT) {
			height = MIN_HEIGHT;
		}

		var inputsStartY = height / 2 - ((inputCount - 1) * PINS_SPACING) / 2;
		var outputsStartY = height / 2 - ((outputCount - 1) * PINS_SPACING) / 2;

		var pins = [];

		var indexOffset = 0;
		for (var i = 0; i < inputCount; i++) {
			var label = inputs[i];
			if (label === null) {
				indexOffset++;
			} else {
				var labelProperties = parseLabel(label);
				pins.push({
					out: false,
					x: -1,
					y: inputsStartY + i * PINS_SPACING,
					orientation: LEFT,
					clock: labelProperties.clock,
					inverted: labelProperties.inverted,
					label: labelProperties.label,
					index: i - indexOffset
				});
			}
		}

		var indexOffset = 0;
		for (var i = 0; i < outputCount; i++) {
			var label = outputs[i];
			if (label === null) {
				indexOffset++;
			} else {
				var labelProperties = parseLabel(label);
				pins.push({
					out: true,
					x: width + 1,
					y: outputsStartY + i * PINS_SPACING,
					orientation: RIGHT,
					clock: labelProperties.clock,
					inverted: labelProperties.inverted,
					label: labelProperties.label,
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

	var CLOCK_TRIANGLE_HEIGHT = 4;
	var CLOCK_TRIANGLE_WIDTH = 5;
	var CLOCK_STROKE_WIDTH = 2;
	var CLOCK_LABEL_OFFSET = 4;

	function createPin(pinX, pinY, orientation) {
		var x2, y2;
		switch (orientation) {
			case RIGHT:
				x2 = pinX - 10;
				y2 = pinY;
				break;
			case DOWN:
				x2 = pinX;
				y2 = pinY - 10;
				break;
			case LEFT:
				x2 = pinX + 10;
				y2 = pinY;
				break;
			case UP:
				x2 = pinX;
				y2 = pinY + 10;
				break;
		}

		var $line = SvgUtil.createElement('line');
		$line.setAttribute('x1', pinX);
		$line.setAttribute('y1', pinY);
		$line.setAttribute('x2', x2);
		$line.setAttribute('y2', y2);
		$line.setAttribute('stroke', 'black');
		$line.setAttribute('stroke-width', '2');
		return $line;
	}

	function createClockSymbol(pinX, pinY, orientation) {
		var x, y;
		switch (orientation) {
			case RIGHT:
				x = pinX - 10;
				y = pinY;
				break;
			case DOWN:
				x = pinX;
				y = pinY - 10;
				break;
			case LEFT:
				x = pinX + 10;
				y = pinY;
				break;
			case UP:
				x = pinX;
				y = pinY + 10;
				break;
		}

		// TODO: orientation
		var $clock = SvgUtil.createElement('polyline');
		$clock.setAttribute('points', [
				x, y - CLOCK_TRIANGLE_HEIGHT,
				x + CLOCK_TRIANGLE_WIDTH, y,
				x, y + CLOCK_TRIANGLE_HEIGHT
			].join(' ')
		);
		$clock.setAttribute('fill', 'none');
		$clock.setAttribute('stroke', 'black');
		$clock.setAttribute('stroke-width', CLOCK_STROKE_WIDTH);
		return $clock;
	}

	function createInvCircle(pinX, pinY, orientation) {
		var distance = INV_RADIUS + INV_STROKE_WIDTH / 2;

		var cx, cy;
		switch (orientation) {
			case RIGHT:
				cx = pinX - 10 + distance;
				cy = pinY;
				break;
			case DOWN:
				cx = pinX;
				cy = pinY - 10 + distance;
				break;
			case LEFT:
				cx = pinX + 10 - distance;
				cy = pinY;
				break;
			case UP:
				cx = pinX;
				cy = pinY + 10 - distance;
				break;
		}

		var $inv = SvgUtil.createElement('circle');
		$inv.setAttribute('cx', cx);
		$inv.setAttribute('cy', cy);
		$inv.setAttribute('r', INV_RADIUS);
		$inv.setAttribute('fill', 'white');
		$inv.setAttribute('stroke', 'black');
		$inv.setAttribute('stroke-width', INV_STROKE_WIDTH);
		return $inv;
	}

	var textAnchorForOrientation = {
		0: 'end',
		1: 'start',
		2: 'start',
		3: 'end'
	};

	function createPinLabel(pinX, pinY, orientation, label, inverted) {
		var x, y;
		switch (orientation) {
			case RIGHT:
				x = pinX - 10 - 3;
				y = pinY + 4;
				break;
			case DOWN:
				x = pinX + 4;
				y = pinY - 10 - 3;
				break;
			case LEFT:
				x = pinX + 10 + 3;
				y = pinY + 4;
				break;
			case UP:
				x = pinX + 4;
				y = pinY + 10 + 3;
				break;
		}

		var $label = SvgUtil.createElement('text');
		$label.setAttribute('x', x);
		$label.setAttribute('y', y);
		if (orientation === UP || orientation === DOWN) {
			$label.setAttribute('transform', 'rotate(-90 ' + x + ' ' + y + ')');
		}
		$label.setAttribute('text-anchor', textAnchorForOrientation[orientation]);
		$label.setAttribute('font-size', '14');
		$label.setAttribute('font-family', 'Source Code Pro');
		if (inverted) {
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

		for (var i = 0; i < pins.length; i++) {
			var pin = pins[i];

			var $pin = createPin(pin.x * 10, pin.y * 10, pin.orientation);
			$container.appendChild($pin);

			var labelOffset = 0;

			if (pin.clock) {
				$container.appendChild(createClockSymbol(pin.x * 10, pin.y * 10, pin.orientation));
				labelOffset += CLOCK_LABEL_OFFSET;
			}

			if (pin.inverted) {
				$container.appendChild(createInvCircle(pin.x * 10, pin.y * 10, pin.orientation));
			}

			if (pin.label) {
				var $pinLabel = createPinLabel(pin.x * 10 + labelOffset, pin.y * 10, pin.orientation, pin.label, pin.inverted);
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
