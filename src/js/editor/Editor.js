/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'Viewport',
	'editor/EditorTools',
	'editor/Connection',
	'sim/Connection',
	'lib/SvgUtil'
], function (Viewport, EditorTools, Connection, SimConnection, SvgUtil) {
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

		this.components = [];
		this.currentComponent = null;

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
					var scaledDiffX = diffX / self.viewport.scale;
					var scaledDiffY = diffY / self.viewport.scale;

					var snappedX = self.startX + Math.round(scaledDiffX / 10);
					var snappedY = self.startY + Math.round(scaledDiffY / 10);

					self.currentComponent.x = snappedX;
					self.currentComponent.y = snappedY;
					self.currentComponent.updateDisplay();
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

			if(self.mouseMode === MOUSE_DRAG_COMPONENT) {
				self.currentComponent = null;
			} else if(self.mouseMode === MOUSE_CONNECT) {
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
			self.run();
		});
	};

	Editor.prototype.addComponent = function (component, x, y) {
		this.components.push(component);

		component.x = x;
		component.y = y;

		var self = this;
		function mousedown(evt) {
			evt.preventDefault();

			if(self.tools.currentTool === EditorTools.TOOL_NORMAL) {
				if(self.mouseMode == MOUSE_UP) {
					self.mouseMode = MOUSE_DRAG_COMPONENT;
					self.mouseStartX = evt.clientX;
					self.mouseStartY = evt.clientY;
					self.startX = component.x;
					self.startY = component.y;
					self.currentComponent = component;

					self.$svg.style.cursor = 'move';
				}
			}
		}

		component.display(this.viewport.$viewportGroup, mousedown);
	};

	function mergeConnections(cons, coords, con1, con2) {
		if(con1 === con2) return;

		// Copy points from con2 to con1
		for(var i = 0; i < con2.length; i++) {
			var pt = con2[i];
			con1.push(pt);
			coords[pt] = con1;
		}

		// Remove con2 from connection list
		var index = cons.indexOf(con2);
		if(index !== -1) {
			cons.splice(index, 1);
		} else {
			console.warn('con2 not in cons');
		}
	}

	Editor.prototype.constructCircuit = function () {
		var coords = {};
		var cons = [];

		// TODO: add all compononts' connection points
		for(var i = 0; i < this.components.length; i++) {
			var com = this.components[i];
			var pts = com.getConnectionPoints();

		}
		// TODO: like that:
		var comp1 = ['0|0'];
		coords['0|0'] = comp1;
		cons.push(comp1);

		// Find connections on endpoints
		for(var i = 0; i < this.connections.length; i++) {
			var con = this.connections[i];
			var pt1 = con.x1 + '|' + con.y1;
			var pt2 = con.x2 + '|' + con.y2;
			if(coords[pt1] && coords[pt2]) {
				// There are connections at both endpoints
				// -> merge them
				mergeConnections(cons, coords, coords[pt1], coords[pt2]);
			} else if(coords[pt1]) {
				// There is a connection at the first endpoint
				// -> add pt2 to it
				coords[pt1].push(pt2);
				coords[pt2] = coords[pt1];
			} else if(coords[pt2]) {
				// There is a connection at the second endpoint
				// -> add pt1 to it
				coords[pt2].push(pt1);
				coords[pt1] = coords[pt2];
			} else {
				// There is no connection at any endpoint
				// -> create a new connection with both endpoints in it
				var connection = [pt1, pt2];
				coords[pt1] = coords[pt2] = connection;
				cons.push(connection);
			}
		}

		// Find connections inbetween endpoints
		for(var i = 0; i < this.connections.length; i++) {
			var con = this.connections[i];

			var pt1 = con.x1 + '|' + con.y1;
			var con1 = coords[pt1];

			if(con.x1 === con.x2) {
				// Vertical line
				var start = Math.min(con.y1, con.y2);
				var end = Math.max(con.y1, con.y2);
				for(var y = start + 1; y < end; y++) {
					var pt2 = con.x1 + '|' + y;
					// If there is an endpoint beneath this connection
					// -> connect the current connection with it
					if(coords[pt2]) {
						mergeConnections(cons, coords, con1, coords[pt2]);
					}
				}
			} else {
				// Horizontal line
				var start = Math.min(con.x1, con.x2);
				var end = Math.max(con.x1, con.x2);
				for(var x = start + 1; x < end; x++) {
					var pt2 = x + '|' + con.y1;
					// If there is an endpoint beneath this connection
					// -> connect the current connection with it
					if(coords[pt2]) {
						mergeConnections(cons, coords, con1, coords[pt2]);
					}
				}
			}
		}

		// Convert all the found connections to simulation connections
		for(var i = 0; i < cons.length; i++) {
			var con = cons[i];
			var simCon = new SimConnection();

			for(var j = 0; j < con.length; j++) {
				var pt = con[j];
				coords[pt] = simCon;
			}

			cons[i] = simCon;
		}

		// TODO: add components to connections
		// for(var i = 0; i < this.components.length; i++) {
		// 	var com = this.components[i];
		//
		// }

		return null;
	};

	Editor.prototype.run = function () {
		var dateObj = window.performance || Date;
		var time = dateObj.now();
		var circuit = this.constructCircuit();
		time = dateObj.now() - time;
		console.log('Constructed circuit in ' + time + 'ms');

		window.circuit = circuit;
		console.log(circuit);
	};

	return Editor;
});
