/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil',
	'editor/Editor'
], function (SvgUtil, Editor) {
	function App() {
		this.editor = new Editor(this);
	}

	return App;
});
