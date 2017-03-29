/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/components/FullAdderComponent',
	'lib/extend'
], function (Component, displayComponent, SimFullAdderComponent, extend) {
	function FullAdderComponent() {
		Component.call(this);

		this.component = new SimFullAdderComponent();

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
				out: false,
				x: -1,
				y: 11,
				name: 'C'
			},
			{
				out: true,
				x: 6,
				y: 5,
				name: 'S'
			},
			{
				out: true,
				x: 6,
				y: 9,
				name: 'C'
			}
		];
	}

	extend(FullAdderComponent, Component);

	FullAdderComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B', 'C'], ['S', 'C'], 'FA');
		$handle.addEventListener('mousedown', mousedown);
	};

	FullAdderComponent.sidebarEntry = {
		name: 'Full Adder',
		category: 'Adder',
		drawPreview: function (svg) {
			displayComponent(svg, ['A', 'B', 'C'], ['S', 'C'], 'FA');
		}
	};

	return FullAdderComponent;
});
