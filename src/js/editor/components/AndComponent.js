/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'lib/extend'
], function (Component, displayComponent, extend) {
	function AndComponent() {
		Component.call(this);
	}

	extend(AndComponent, Component);

	AndComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B'], ['Q'], '&');
		$handle.addEventListener('mousedown', mousedown);
	};

	return AndComponent;
});
