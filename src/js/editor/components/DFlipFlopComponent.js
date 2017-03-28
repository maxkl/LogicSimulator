/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/components/DFlipFlopComponent',
	'lib/extend'
], function (Component, displayComponent, SimDFlipFlopComponent, extend) {
	function DFlipFlopComponent() {
		Component.call(this);

		this.component = new SimDFlipFlopComponent();

		this.connectionPoints = [
			{
				out: false,
				x: -1,
				y: 3,
				name: 'D'
			},
			{
				out: false,
				x: -1,
				y: 7,
				name: 'CLK'
			},
			{
				out: true,
				x: 6,
				y: 5,
				name: 'Q'
			}
		];
	}

	extend(DFlipFlopComponent, Component);

	DFlipFlopComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['D', 'CLK'], ['Q'], 'D');
		$handle.addEventListener('mousedown', mousedown);
	};

	return DFlipFlopComponent;
});
