/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/displayComponent'
], function (displayComponent) {
	function AndComponent() {}

	AndComponent.prototype.display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B'], ['Q'], '&');
		$handle.addEventListener('mousedown', mousedown);
	};

	return AndComponent;
});
