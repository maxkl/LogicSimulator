/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var App = (function (window, document) {
	"use strict";

	function App() {
		this.log = new Logger("App");
		
		this.components = [];

		this.editor = new Editor(this);

		this.log.debug("Started");
	}
	
	App.prototype.addComponent = function (component) {
		var $container = SvgUtil.createElement("g");
		$container.setAttribute("transform", "matrix(1 0 0 1 300 300)");

		component.initDisplay($container);

		this.editor.renderer.viewport.$viewportGroup.appendChild($container);
		
		this.components.push(component);
	};

	return App;
})(window, document);
