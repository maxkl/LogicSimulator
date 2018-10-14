/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil'
], function (SvgUtil) {
	var DEFAULT = 0;
	var SELECTED = 1;
	var ACTIVE = 2;

	var STATE_COLORS = [
		'#000',
		'#0288d1',
		'#f00'
	];

	function Connection(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.startX1 = 0;
		this.startY1 = 0;
		this.startX2 = 0;
		this.startY2 = 0;

		this.selected = false;

		this.$line = null;
	}

	Connection.load = function (data) {
		return new Connection(data.x1, data.y1, data.x2, data.y2);
	};

	Connection.prototype.save = function () {
		return {
			x1: this.x1,
			y1: this.y1,
			x2: this.x2,
			y2: this.y2
		};
	};

	Connection.prototype.select = function () {
		this.selected = true;
		this.setState(SELECTED);
	};

	Connection.prototype.deselect = function () {
		this.selected = false;
		this.setState(DEFAULT);
	};

	Connection.prototype.display = function ($container) {
		this.$line = SvgUtil.createElement('line');
		this.$line.setAttribute('stroke', 'black');
		this.$line.setAttribute('stroke-width', '2');
		this.$line.setAttribute('stroke-linecap', 'square');
		this.updateDisplay();

		$container.appendChild(this.$line);
	};

	Connection.prototype.remove = function () {
		if(!this.$line) return;
		this.$line.parentNode.removeChild(this.$line);
		this.$line = null;
	};

	Connection.prototype.updateDisplay = function () {
		if(!this.$line) return;
		this.$line.setAttribute('x1', this.x1 * 10);
		this.$line.setAttribute('y1', this.y1 * 10);
		this.$line.setAttribute('x2', this.x2 * 10);
		this.$line.setAttribute('y2', this.y2 * 10);
	};

	Connection.prototype.setState = function (state) {
		if(!this.$line) return;
		this.$line.setAttribute('stroke', STATE_COLORS[state]);
	};

	Connection.prototype.serializeForSimulation = function () {
		return {
			x1: this.x1,
			y1: this.y1,
			x2: this.x2,
			y2: this.y2
		};
	};

	Connection.DEFAULT = DEFAULT;
	Connection.SELECTED = SELECTED;
	Connection.ACTIVE = ACTIVE;

	return Connection;
});
