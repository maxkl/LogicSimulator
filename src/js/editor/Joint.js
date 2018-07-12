/**
 * Copyright: (c) 2018 Max Klein
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

	function Joint(x, y) {
		this.x = x;
		this.y = y;
		this.startX = 0;
		this.startY = 0;

		this.selected = false;

		this.$dot = null;
	}

	Joint.prototype.select = function () {
		this.selected = true;
		this.setState(SELECTED);
	};

	Joint.prototype.deselect = function () {
		this.selected = false;
		this.setState(DEFAULT);
	};

	Joint.prototype.display = function ($container) {
		this.$dot = SvgUtil.createElement('circle');
		this.$dot.setAttribute('fill', 'black');
		this.$dot.setAttribute('r', '4');
		this.updateDisplay();

		$container.appendChild(this.$dot);
	};

	Joint.prototype.remove = function () {
		this.$dot.parentNode.removeChild(this.$dot);
		this.$dot = null;
	};

	Joint.prototype.updateDisplay = function () {
		if(!this.$dot) return;
		this.$dot.setAttribute('cx', this.x * 10);
		this.$dot.setAttribute('cy', this.y * 10);
	};

	Joint.prototype.setState = function (state) {
		if(!this.$dot) return;
		this.$dot.setAttribute('fill', STATE_COLORS[state]);
	};

	Joint.DEFAULT = DEFAULT;
	Joint.SELECTED = SELECTED;
	Joint.ACTIVE = ACTIVE;

	return Joint;
});
