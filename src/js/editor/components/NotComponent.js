/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'lib/extend'
], function (Component, displayComponent, extend) {
	function NotComponent() {
		Component.call(this);
	}

	extend(NotComponent, Component);

	NotComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A'], ['!Q'], '1');
		$handle.addEventListener('mousedown', mousedown);
	};

	return NotComponent;
});
