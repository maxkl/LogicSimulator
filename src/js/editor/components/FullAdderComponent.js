/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'lib/extend'
], function (Component, displayComponent, extend) {
	function FullAdderComponent() {
		Component.call(this);
	}

	extend(FullAdderComponent, Component);

	FullAdderComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B', 'C'], ['S', 'C'], 'FA');
		$handle.addEventListener('mousedown', mousedown);
	};

	return FullAdderComponent;
});
