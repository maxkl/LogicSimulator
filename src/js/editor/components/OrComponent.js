/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/displayComponent',
	'lib/extend'
], function (Component, displayComponent, extend) {
	function OrComponent() {
		Component.call(this);
	}

	extend(OrComponent, Component);

	OrComponent.prototype._display = function ($c, mousedown) {
		var $handle = displayComponent($c, ['A', 'B', 'C'], ['Q'], '≥1');
		$handle.addEventListener('mousedown', mousedown);
	};

	return OrComponent;
});
