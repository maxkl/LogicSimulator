/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'editor/displayComponent',
	'lib/SvgUtil'
], function (displayComponent, SvgUtil) {
	function Component() {
		this.x = 0;
		this.y = 0;
		this.startX = 0;
		this.startY = 0;

		this.$group = null;
		this.transform = null;

		this.mousedownCallback = null;

		this.selected = false;
	}

	Component.prototype.save = function () {
		var data = {
			type: this.constructor.typeName,
			x: this.x,
			y: this.y
		};

		this._save(data);

		return data;
	};

	Component.prototype.load = function (data) {
		this.x = data.x;
		this.y = data.y;
		this._load(data);
	};

	Component.prototype.select = function () {
		this.selected = true;
		this._select();
	};

	Component.prototype.deselect = function () {
		this.selected = false;
		this._deselect();
	};

	Component.prototype.display = function ($container) {
		this.$group = SvgUtil.createElement('g');
		this.$group.setAttribute('transform', 'matrix(1 0 0 1 0 0)');
		this.transform = this.$group.transform.baseVal[0];
		this.updateDisplay();

		this._display(this.$group);

		$container.appendChild(this.$group);
	};

	Component.prototype.remove = function () {
		if(!this.$group) return;
		this.$group.parentNode.removeChild(this.$group);
		this.$group = null;
	};

	Component.prototype.updateDisplay = function () {
		if(!this.$group) return;
		this.transform.matrix.e = this.x * 10;
		this.transform.matrix.f = this.y * 10;
	};

	Component.prototype.serializeForSimulation = function () {
		var data = this._serializeForSimulation();

		data.x = this.x;
		data.y = this.y;

		if (this.isCustom) {
			this.updatePins();
		}

		var pinsData = [];
		for (var i = 0; i < this.pins.length; i++) {
			var pin = this.pins[i];
			pinsData.push({
				x: pin.x,
				y: pin.y,
				out: pin.out,
				index: pin.index
			});
		}
		data.pins = pinsData;

		return data;
	};

	return Component;
});
