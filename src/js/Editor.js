/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

var Editor = (function () {
	function Editor(app) {
		this.log = new Logger('Editor');

		this.app = app;

		this.renderer = new Renderer(app);

		this.registerListeners();

		this.log.debug('Constructed');
	}

	Editor.prototype.registerListeners = function () {
		var renderer = this.renderer;

		var $canvas = renderer.$svg;

		var moving = false;
		var startMouseX, startMouseY;
		var startX, startY;

		$canvas.addEventListener('mousedown', function (evt) {
			evt.preventDefault();
			evt.stopPropagation();

			moving = true;
			startMouseX = evt.clientX;
			startMouseY = evt.clientY;
			startX = renderer.viewport.x;
			startY = renderer.viewport.y;

			$canvas.style.cursor = 'move';
		});

		var zoomInAmount = 1.1;
		var zoomOutAmount = 1 / zoomInAmount;
		$canvas.addEventListener('wheel', function (evt) {
			if(evt.deltaY != 0) {
				var zoomAmount = evt.deltaY < 0 ? zoomInAmount : zoomOutAmount;
				renderer.viewport.zoom(zoomAmount, evt.clientX, evt.clientY);
			}
		});

		window.addEventListener('mousemove', function (evt) {
			evt.preventDefault();
			evt.stopPropagation();

			if(moving) {
				var diffX = evt.clientX - startMouseX;
				var diffY = evt.clientY - startMouseY;
				renderer.viewport.setPosition(startX + diffX, startY + diffY);
			}
		});

		window.addEventListener('mouseup', function (evt) {
			evt.preventDefault();
			evt.stopPropagation();

			moving = false;

			$canvas.style.removeProperty('cursor');
		});
	};

	return Editor;
})();
