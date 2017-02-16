/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/displayComponent'
], function (displayComponent) {
	function NotComponent() {}

	NotComponent.prototype.display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A'], ['!Q'], '1');
		$handle.addEventListener('mousedown', mousedown);
	};

	return NotComponent;
});
