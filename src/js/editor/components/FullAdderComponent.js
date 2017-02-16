/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/displayComponent'
], function (displayComponent) {
	function FullAdderComponent() {}

	FullAdderComponent.prototype.display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B', 'C'], ['S', 'C'], 'FA');
		$handle.addEventListener('mousedown', mousedown);
	};

	return FullAdderComponent;
});
