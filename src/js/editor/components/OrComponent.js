/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'sim/components/OrComponent',
	'lib/extend'
], function (Component, displayComponent, SimOrComponent, extend) {
	function OrComponent() {
		Component.call(this);

		this.component = new SimOrComponent();

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

	extend(OrComponent, Component);

	OrComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B'], ['Q'], '≥1');
		$handle.addEventListener('mousedown', mousedown);
	};

	OrComponent.sidebarEntry = {
		name: 'Or',
		category: 'Gates',
		drawPreview: function (svg) {
			displayComponent(svg, ['A', 'B'], ['Q'], '≥1');
		}
	};

	return OrComponent;
});
