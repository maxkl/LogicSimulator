/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil'
], function (SvgUtil) {
	function Connection(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;

		this.$line = null;
	}

	Connection.prototype.display = function ($container) {
		this.$line = SvgUtil.createElement('line');
		this.$line.setAttribute('stroke', 'black');
		this.$line.setAttribute('stroke-width', '2');
		this.updateDisplay();

		$container.appendChild(this.$line);
	};

	Connection.prototype.remove = function () {
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

	return Connection;
});
