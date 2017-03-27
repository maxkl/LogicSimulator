/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/NotComponent',
	'lib/extend'
], function (Component, displayComponent, SimNotComponent, extend) {
	function NotComponent() {
		Component.call(this);

		this.component = new SimNotComponent();

		this.connectionPoints = [
			{
				out: false,
				x: -1,
				y: 3,
				name: 'A'
			},
			{
				out: true,
				x: 6,
				y: 3,
				name: 'Q'
			}
		];
	}

	extend(NotComponent, Component);

	NotComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A'], ['!Q'], '1');
		$handle.addEventListener('mousedown', mousedown);
	};

	return NotComponent;
});
