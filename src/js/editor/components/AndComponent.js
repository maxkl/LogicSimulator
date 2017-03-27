/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/AndComponent',
	'lib/extend'
], function (Component, displayComponent, SimAndComponent, extend) {
	function AndComponent() {
		Component.call(this);

		this.component = new SimAndComponent();

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
				y: 5,
				name: 'Q'
			}
		];
	}

	extend(AndComponent, Component);

	AndComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B'], ['Q'], '&');
		$handle.addEventListener('mousedown', mousedown);
	};

	return AndComponent;
});
