/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

var Renderer = (function () {
	function Renderer(app) {
		this.log = new Logger('Renderer');

		this.app = app;

		this.$svg = document.getElementById('editor-svg');
		this.viewport = new Viewport(app, this.$svg);

		this.log.debug('Constructed');
	}

	return Renderer;
})();
