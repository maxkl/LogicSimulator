/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/displayComponent'
], function (displayComponent) {
	function HalfAdderComponent() {}

	HalfAdderComponent.prototype.display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B'], ['S', 'C'], 'HA');
		$handle.addEventListener('mousedown', mousedown);
	};

	return HalfAdderComponent;
});
