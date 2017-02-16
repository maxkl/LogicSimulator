/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/displayComponent'
], function (displayComponent) {
	function OrComponent() {}

	OrComponent.prototype.display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B', 'C'], ['Q'], '≥1');
		$handle.addEventListener('mousedown', mousedown);
	};

	return OrComponent;
});
