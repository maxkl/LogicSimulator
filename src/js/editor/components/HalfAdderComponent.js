/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/components/HalfAdderComponent',
	'lib/extend'
], function (Component, displayComponent, SimHalfAdderComponent, extend) {
	function HalfAdderComponent() {
		Component.call(this);

		this.component = new SimHalfAdderComponent();

		this.connectionPoints = [
			{
				out: false,
				x: -1,
				y: 3,
				name: 'A'
			},
			{
				out: false,
				x: -1,
				y: 7,
				name: 'B'
			},
			{
				out: true,
				x: 6,
				y: 3,
				name: 'S'
			},
			{
				out: true,
				x: 6,
				y: 7,
				name: 'C'
			}
		];
	}

	extend(HalfAdderComponent, Component);

	HalfAdderComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B'], ['S', 'C'], 'HA');
		$handle.addEventListener('mousedown', mousedown);
	};

	return HalfAdderComponent;
});
