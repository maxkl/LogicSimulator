/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/displayComponent',
	'lib/SvgUtil'
], function (displayComponent, SvgUtil) {
	function Component() {
		this.x = 0;
		this.y = 0;

		this.$group = null;
		this.transform = null;
	}

	Component.prototype.display = function ($container, mousedown) {
		this.$group = SvgUtil.createElement('g');
		this.$group.setAttribute('transform', 'matrix(1 0 0 1 0 0)');
		this.transform = this.$group.transform.baseVal[0];
		this.updateDisplay();

		this._display(this.$group, mousedown);

		$container.appendChild(this.$group);
	};

	Component.prototype.remove = function () {
		this.$group.parentNode.removeChild(this.$group);
		this.$group = null;
	};

	Component.prototype.updateDisplay = function () {
		if(!this.$group) return;
		this.transform.matrix.e = this.x * 10;
		this.transform.matrix.f = this.y * 10;
	};

	return Component;
});
