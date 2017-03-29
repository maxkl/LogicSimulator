/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/components/ConstComponent',
	'lib/extend'
], function (Component, displayComponent, SimConstComponent, extend) {
	function ConstComponent(value) {
		Component.call(this);

		this.value = value;

		this.component = new SimConstComponent(value);

		this.connectionPoints = [
			{
				out: true,
				x: 6,
				y: 3,
				name: 'Q'
			}
		];
	}

	extend(ConstComponent, Component);

	ConstComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, [], ['Q'], this.value ? '1' : '0');
		$handle.addEventListener('mousedown', mousedown);
	};

	ConstComponent.sidebarEntry = {
		name: 'Constant',
		category: 'Basic',
		drawPreview: function (svg) {
			displayComponent(svg, [], ['Q'], '1');
		}
	};

	return ConstComponent;
});
