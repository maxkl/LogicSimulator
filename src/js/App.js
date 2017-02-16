/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil',
	'editor/Editor'
], function (SvgUtil, Editor) {
	function App() {
		this.components = [];

		this.editor = new Editor(this);

		console.log('App started');
	}

	App.prototype.addComponent = function (component, x, y) {
		this.editor.addComponent(component, x, y);

		this.components.push(component);
	};

	return App;
});
