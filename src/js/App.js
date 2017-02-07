/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

var App = (function () {
	function App() {
		this.log = new Logger('App');

		this.components = [];

		this.editor = new Editor(this);

		this.log.debug('Started');
	}

	App.prototype.addComponent = function (component, x, y) {
		var $container = SvgUtil.createElement('g');
		$container.setAttribute('transform', 'matrix(1 0 0 1 ' + x + ' ' + y + ')');

		component.initDisplay($container);

		this.editor.renderer.viewport.$viewportGroup.appendChild($container);

		this.components.push(component);
	};

	return App;
})();
