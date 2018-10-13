/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'sim/components/SRLatchComponent',
	'lib/extend'
], function (Component, ComponentProperties, displayComponent, SimSRLatchComponent, extend) {
	function SRLatchComponent() {
		Component.call(this);

		this.pins = null;

		this.$container = null;
		this.$rect = null;

		this.properties = new ComponentProperties([]);

		this.layout();
	}

	extend(SRLatchComponent, Component);

	SRLatchComponent.prototype._save = function (data) {};

	SRLatchComponent.prototype._load = function (data) {};

	SRLatchComponent.prototype.layout = function () {
		var layout = displayComponent.layout(['S', null, 'R'], ['Q', null, '!Q']);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	SRLatchComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	SRLatchComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, 'SR');
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	SRLatchComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	SRLatchComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	SRLatchComponent.prototype.constructSimComponent = function () {
		return new SimSRLatchComponent();
	};

	SRLatchComponent.typeName = 'srlatch';
	SRLatchComponent.sidebarEntry = {
		name: 'SR Latch',
		category: 'Memory',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(['S', null, 'R'], ['Q', null, '!Q']);
			displayComponent(svg, layout.width, layout.height, layout.pins, 'SR');
		}
	};

	return SRLatchComponent;
});
