/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'Viewport',
	'editor/EditorTools',
	'editor/Connection',
	'lib/SvgUtil'
], function (Viewport, EditorTools, Connection, SvgUtil) {
	var MOUSE_UP = 0;
	var MOUSE_PAN = 1;
	var MOUSE_DRAG_COMPONENT = 2;
	var MOUSE_CONNECT = 3;

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

		this.connections = [];
		this.currentConnection = null;

		this.registerListeners();
	}

	Editor.prototype.registerListeners = function () {
		var self = this;

		var startX, startY;

		this.$svg.addEventListener('mousedown', function (evt) {
			evt.preventDefault();

			if(self.tools.currentTool === EditorTools.TOOL_NORMAL) {
				if(self.mouseMode == MOUSE_UP) {
					self.mouseMode = MOUSE_PAN;

					self.mouseStartX = evt.clientX;
					self.mouseStartY = evt.clientY;
					self.startX = self.viewport.x;
					self.startY = self.viewport.y;

					self.$svg.style.cursor = 'move';
				}
			} else if(self.tools.currentTool === EditorTools.TOOL_CONNECT) {
				if(self.mouseMode === MOUSE_UP) {
					self.mouseMode = MOUSE_CONNECT;

					var rect = self.$svg.getBoundingClientRect();
					var x = self.viewport.viewportToWorldX(evt.clientX - rect.left);
					var y = self.viewport.viewportToWorldY(evt.clientY - rect.top);
					var snappedX = Math.round(x / 10);
					var snappedY = Math.round(y / 10);

					self.currentConnection = new Connection(snappedX, snappedY, snappedX, snappedY);
					self.currentConnection.display(self.viewport.$viewportGroup);
				}
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
				} else if(self.mouseMode === MOUSE_CONNECT) {
					var rect = self.$svg.getBoundingClientRect();
					var x = self.viewport.viewportToWorldX(evt.clientX - rect.left);
					var y = self.viewport.viewportToWorldY(evt.clientY - rect.top);

					var snappedX, snappedY;
					if(Math.abs(x - self.currentConnection.x1 * 10) < Math.abs(y - self.currentConnection.y1 * 10)) {
						snappedX = self.currentConnection.x1;
						snappedY = Math.round(y / 10);
					} else {
						snappedX = Math.round(x / 10);
						snappedY = self.currentConnection.y1;
					}

					self.currentConnection.x2 = snappedX;
					self.currentConnection.y2 = snappedY;
					self.currentConnection.updateDisplay();
				}
			}
		});

		window.addEventListener('mouseup', function (evt) {
			evt.preventDefault();

			if(self.mouseMode === MOUSE_CONNECT) {
				if(self.currentConnection.x1 !== self.currentConnection.x2 || self.currentConnection.y1 !== self.currentConnection.y2) {
					self.connections.push(self.currentConnection);
				} else {
					self.currentConnection.remove();
				}
				self.currentConnection = null;
			}

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

			if(self.tools.currentTool === EditorTools.TOOL_NORMAL) {
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
		}

		component.display($container, mousedown);

		this.viewport.$viewportGroup.appendChild($container);
	};

	return Editor;
});
