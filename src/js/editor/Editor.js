/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'Viewport',
	'editor/EditorTools',
	'lib/SvgUtil'
], function (Viewport, EditorTools, SvgUtil) {
	var MOUSE_UP = 0;
	var MOUSE_PAN = 1;
	var MOUSE_DRAG_COMPONENT = 2;

	function Editor(app) {
		this.app = app;

		this.tools = new EditorTools(app);
		this.$svg = document.getElementById('editor-svg');
		this.viewport = new Viewport(app, this.$svg);

		this.mouseMode = MOUSE_UP;
		this.mouseStartX = 0;
		this.mouseStartY = 0;
		this.startX = 0;
		this.startY = 0;

		this.registerListeners();
	}

	Editor.prototype.registerListeners = function () {
		var self = this;

		var startX, startY;

		this.$svg.addEventListener('mousedown', function (evt) {
			evt.preventDefault();

			if(self.mouseMode == MOUSE_UP) {
				self.mouseMode = MOUSE_PAN;
				self.mouseStartX = evt.clientX;
				self.mouseStartY = evt.clientY;
				self.startX = self.viewport.x;
				self.startY = self.viewport.y;

				self.$svg.style.cursor = 'move';
			}
		});

		var zoomInAmount = 1.1;
		var zoomOutAmount = 1 / zoomInAmount;
		this.$svg.addEventListener('wheel', function (evt) {
			if(evt.deltaY != 0) {
				var zoomAmount = evt.deltaY < 0 ? zoomInAmount : zoomOutAmount;
				var rect = self.$svg.getBoundingClientRect();
				var mouseX = evt.clientX - rect.left;
				var mouseY = evt.clientY - rect.top;
				self.viewport.zoom(zoomAmount, mouseX, mouseY);
			}
		});

		window.addEventListener('mousemove', function (evt) {
			evt.preventDefault();

			if(self.mouseMode != MOUSE_UP) {
				var diffX = evt.clientX - self.mouseStartX;
				var diffY = evt.clientY - self.mouseStartY;

				if(self.mouseMode == MOUSE_PAN) {
					self.viewport.setPosition(self.startX + diffX, self.startY + diffY);
				} else if(self.mouseMode == MOUSE_DRAG_COMPONENT) {
					var newX = self.startX + diffX / self.viewport.scale;
					var newY = self.startY + diffY / self.viewport.scale;
					var snappedX = Math.round(newX / 10) * 10;
					var snappedY = Math.round(newY / 10) * 10;
					self.targetComponentTransform.matrix.e = snappedX;
					self.targetComponentTransform.matrix.f = snappedY;
				}
			}
		});

		window.addEventListener('mouseup', function (evt) {
			evt.preventDefault();

			self.mouseMode = MOUSE_UP;

			self.$svg.style.removeProperty('cursor');
		});

		this.tools.on('run', function () {
			console.log('RUN!');
		});
	};

	Editor.prototype.addComponent = function (component, x, y) {
		var $container = SvgUtil.createElement('g');
		$container.setAttribute('transform', 'matrix(1 0 0 1 ' + x + ' ' + y + ')');
		var transform = $container.transform.baseVal[0];

		var self = this;
		function mousedown(evt) {
			evt.preventDefault();

			if(self.mouseMode == MOUSE_UP) {
				self.mouseMode = MOUSE_DRAG_COMPONENT;
				self.mouseStartX = evt.clientX;
				self.mouseStartY = evt.clientY;
				self.startX = transform.matrix.e;
				self.startY = transform.matrix.f;
				self.targetComponentTransform = transform;

				self.$svg.style.cursor = 'move';
			}
		}

		component.display($container, mousedown);

		this.viewport.$viewportGroup.appendChild($container);
	};

	return Editor;
});
