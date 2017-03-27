/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'lib/extend'
], function (Component, displayComponent, extend) {
	function HalfAdderComponent() {
		Component.call(this);
	}

	extend(HalfAdderComponent, Component);

	HalfAdderComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B'], ['S', 'C'], 'HA');
		$handle.addEventListener('mousedown', mousedown);
	};

	return HalfAdderComponent;
});
