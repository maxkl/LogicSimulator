/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'Viewport'
], function (Viewport) {
	function Renderer(app) {
		this.app = app;

		this.$svg = document.getElementById('editor-svg');
		this.viewport = new Viewport(app, this.$svg);

		console.log('Renderer constructed');
	}

	return Renderer;
});
