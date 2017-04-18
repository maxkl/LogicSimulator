/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'Viewport',
	'editor/EditorTools',
	'editor/Sidebar',
	'editor/Connection',
	'sim/Connection',
	'sim/Circuit',
	'lib/SvgUtil'
], function (Viewport, EditorTools, Sidebar, Connection, SimConnection, SimCircuit, SvgUtil) {
	var MOUSE_UP = 0;
	var MOUSE_PAN = 1;
	var MOUSE_DRAG_COMPONENT = 2;
	var MOUSE_SELECT = 3;
	var MOUSE_DESELECT = 4;
	var MOUSE_CONNECT = 5;

	function Editor(app) {
		this.app = app;

		this.tools = new EditorTools(app);
		this.sidebar = new Sidebar(app);
		this.$svg = document.getElementById('editor-svg');
		this.viewport = new Viewport(app, this.$svg);
		this.$propertyOverlay = document.getElementById('property-overlay');

		this.mouseMode = MOUSE_UP;
		this.mouseStartX = 0;
		this.mouseStartY = 0;
		this.startX = 0;
		this.startY = 0;
		this.showSidebarOnDrop = false;

		this.selectedComponents = [];

		this.propertyOverlayVisible = false;

		this.connections = [];
		this.currentConnection = null;

		this.components = [];
		this.currentComponent = null;

		this.simulationCircuit = null;
		var self = this;
		this.boundSimulationCycle = function () {
			self.simulationCycle();
		};
		this.simulationInterval = null;

		this.registerListeners();
	}

	Editor.prototype.registerListeners = function () {
		var self = this;

		var startX, startY;

		this.$svg.addEventListener('mousedown', function (evt) {
			evt.preventDefault();

			if(self.tools.currentTool === EditorTools.TOOL_NORMAL) {
				if(self.mouseMode === MOUSE_UP) {
					self.mouseMode = MOUSE_PAN;

					self.mouseStartX = evt.clientX;
					self.mouseStartY = evt.clientY;
					self.startX = self.viewport.x;
					self.startY = self.viewport.y;

					self.$svg.style.cursor = 'move';
				}
			} else if(self.tools.currentTool === EditorTools.TOOL_SELECT) {
				if(self.mouseMode === MOUSE_UP) {
					self.mouseMode = MOUSE_DESELECT;

					if(!evt.ctrlKey) {
						self.deselectAll();
					}
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

				if(self.mouseMode === MOUSE_PAN) {
					self.viewport.setPosition(self.startX + diffX, self.startY + diffY);
				} else if(self.mouseMode === MOUSE_DRAG_COMPONENT) {
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

			if(self.mouseMode !== MOUSE_UP) {
				if(self.mouseMode === MOUSE_DRAG_COMPONENT) {
					self.currentComponent = null;

					if(self.showSidebarOnDrop) {
						self.showSidebarOnDrop = false;
						self.sidebar.show();
					}
				} else if(self.mouseMode === MOUSE_CONNECT) {
					if(self.currentConnection.x1 !== self.currentConnection.x2 || self.currentConnection.y1 !== self.currentConnection.y2) {
						self.connections.push(self.currentConnection);
					} else {
						self.currentConnection.remove();
					}
					self.currentConnection = null;
				}

				if(self.tools.currentTool === EditorTools.TOOL_CONNECT) {
					self.$svg.style.cursor = 'crosshair';
				} else {
					self.$svg.style.removeProperty('cursor');
				}

				self.mouseMode = MOUSE_UP;
			}
		});

		this.tools.on('tool-changed', function (tool, previousTool) {
			if(tool === EditorTools.TOOL_CONNECT) {
				self.$svg.style.cursor = 'crosshair';
			} else {
				self.$svg.style.removeProperty('cursor');
			}

			if(previousTool === EditorTools.TOOL_SELECT) {
				self.deselectAll();
			}
		});

		this.tools.on('run', function () {
			self.sidebar.hide(true);
			self.$propertyOverlay.classList.remove('visible');

			self.tools.setTool(EditorTools.TOOL_NORMAL);
			self.startSimulation();
		});

		this.tools.on('stop', function () {
			self.stopSimulation();

			self.sidebar.show();
			if(self.propertyOverlayVisible) {
				self.$propertyOverlay.classList.add('visible');
			}
		});

		this.tools.on('resume', function () {
			self.resumeSimulation();
		});

		this.tools.on('pause', function () {
			self.pauseSimulation();
		});

		this.sidebar.on('component-mousedown', function (evt, entry) {
			self.sidebar.hide();

			var rect = self.$svg.getBoundingClientRect();
			var x = self.viewport.viewportToWorldX(evt.clientX - rect.left);
			var y = self.viewport.viewportToWorldY(evt.clientY - rect.top);

			var snappedX = Math.round(x / 10);
			var snappedY = Math.round(y / 10);

			var component = new entry.ctor();
			self.addComponent(component, snappedX, snappedY);

			self.mouseMode = MOUSE_DRAG_COMPONENT;
			self.mouseStartX = evt.clientX;
			self.mouseStartY = evt.clientY;
			self.startX = component.x;
			self.startY = component.y;
			self.currentComponent = component;

			self.$svg.style.cursor = 'move';

			self.showSidebarOnDrop = true;
		});
	};

	Editor.prototype.updatePropertyOverlay = function () {
		var found = false;
		if(this.selectedComponents.length === 1) {
			var component = this.selectedComponents[0];
			if(component.properties) {
				found = true;

				this.propertyOverlayVisible = true;
				this.$propertyOverlay.classList.add('visible');

				component.properties.display(this.$propertyOverlay);
			}
		}

		if(!found) {
			this.propertyOverlayVisible = false;
			this.$propertyOverlay.classList.remove('visible');
		}
	};

	Editor.prototype.select = function (component) {
		component.select();
		this.selectedComponents.push(component);

		this.updatePropertyOverlay();
	};

	Editor.prototype.deselect = function (component) {
		var index = this.selectedComponents.indexOf(component);
		if(index !== -1) {
			this.selectedComponents.splice(index, 1);
			component.deselect();

			this.updatePropertyOverlay();
		}
	};

	Editor.prototype.deselectAll = function () {
		for(var i = 0; i < this.selectedComponents.length; i++) {
			var component = this.selectedComponents[i];
			component.deselect();
		}

		this.selectedComponents.length = 0;

		this.updatePropertyOverlay();
	};

	Editor.prototype.addComponent = function (component, x, y) {
		this.components.push(component);

		component.x = x;
		component.y = y;

		var self = this;
		function mousedown(evt) {
			evt.preventDefault();

			if(self.tools.running) {
				//
			} else {
				if(self.tools.currentTool === EditorTools.TOOL_NORMAL) {
					if(self.mouseMode === MOUSE_UP) {
						self.mouseMode = MOUSE_DRAG_COMPONENT;
						self.mouseStartX = evt.clientX;
						self.mouseStartY = evt.clientY;
						self.startX = component.x;
						self.startY = component.y;
						self.currentComponent = component;

						self.$svg.style.cursor = 'move';
					}
				} else if(self.tools.currentTool === EditorTools.TOOL_SELECT) {
					if(self.mouseMode === MOUSE_UP) {
						self.mouseMode = MOUSE_SELECT;

						if(evt.ctrlKey) {
							if(component.selected) {
								self.deselect(component);
							} else {
								self.select(component);
							}
						} else {
							self.deselectAll();
							self.select(component);
						}
					}
				}
			}
		}

		component.display(this.viewport.$viewportGroup, mousedown);
	};

	function ConstructionConnection(points, editorConnections) {
		this.points = points;
		this.editorConnections = editorConnections;
	}

	ConstructionConnection.prototype.merge = function (other, coords, connections) {
		if(other === this) return;

		// Copy points from `other` to `this`
		for(var i = 0; i < other.points.length; i++) {
			var point = other.points[i];
			this.points.push(point);
			coords[point] = this;
		}

		for(var i = 0; i < other.editorConnections.length; i++) {
			this.editorConnections.push(other.editorConnections[i]);
		}

		// Remove `other` from connection list
		var index = connections.indexOf(other);
		if(index !== -1) {
			connections.splice(index, 1);
		} else {
			console.warn('`other` not in connections list');
		}
	};

	Editor.prototype.constructCircuit = function () {
		var coords = {};

		var connections = [];
		var components = [];

		for(var i = 0; i < this.components.length; i++) {
			var com = this.components[i];
			var pins = com.pins;

			for(var j = 0; j < pins.length; j++) {
				var pin = pins[j];
				var x = com.x + pin.x;
				var y = com.y + pin.y;
				var pt = x + '|' + y;

				if(!coords[pt]) {
					var con = new ConstructionConnection([pt], []);
					coords[pt] = con;
					connections.push(con);
				}
			}
		}

		// Find connections on endpoints
		for(var i = 0; i < this.connections.length; i++) {
			var con = this.connections[i];
			var pt1 = con.x1 + '|' + con.y1;
			var pt2 = con.x2 + '|' + con.y2;
			if(coords[pt1] && coords[pt2]) {
				// There are connections at both endpoints
				// -> merge them
				coords[pt1].merge(coords[pt2], coords, connections);
				coords[pt1].editorConnections.push(con);
			} else if(coords[pt1]) {
				// There is a connection at the first endpoint
				// -> add pt2 to it
				coords[pt1].points.push(pt2);
				coords[pt1].editorConnections.push(con);
				coords[pt2] = coords[pt1];
			} else if(coords[pt2]) {
				// There is a connection at the second endpoint
				// -> add pt1 to it
				coords[pt2].points.push(pt1);
				coords[pt2].editorConnections.push(con);
				coords[pt1] = coords[pt2];
			} else {
				// There is no connection at any endpoint
				// -> create a new connection with both endpoints in it
				var connection = new ConstructionConnection([pt1, pt2], [con]);
				coords[pt1] = coords[pt2] = connection;
				connections.push(connection);
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
						con1.merge(coords[pt2], coords, connections);
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
						con1.merge(coords[pt2], coords, connections);
					}
				}
			}
		}

		// Convert all the found connections to simulation connections
		for(var i = 0; i < connections.length; i++) {
			var con = connections[i];
			var simCon = new SimConnection();
			simCon.userData = con.editorConnections;

			for(var j = 0; j < con.points.length; j++) {
				var pt = con.points[j];
				coords[pt] = simCon;
			}

			connections[i] = simCon;
		}

		for(var i = 0; i < this.components.length; i++) {
			var com = this.components[i];
			var pins = com.pins;

			var component = com.constructSimComponent();
			component.userData = com;
			for(var j = 0; j < pins.length; j++) {
				var pin = pins[j];
				var x = com.x + pin.x;
				var y = com.y + pin.y;
				var con = coords[x + '|' + y];

				if(pin.out) {
					con.addInput(component, pin.index);
				} else {
					con.addOutput(component, pin.index);
				}
			}
			components.push(component);
		}

		return new SimCircuit(components, connections);
	};

	Editor.prototype.updateSimulationDisplay = function () {
		var simConnections = this.simulationCircuit.connections;
		for(var i = 0; i < simConnections.length; i++) {
			var simConnection = simConnections[i];

			var connections = simConnection.userData;
			for(var j = 0; j < connections.length; j++) {
				var connection = connections[j];
				connection.setState(simConnection.value);
			}
		}
	};

	Editor.prototype.simulationCycle = function () {
		this.simulationCircuit.cycle();
		this.updateSimulationDisplay();
	};

	Editor.prototype.startSimulationInterval = function () {
		this.simulationInterval = setInterval(this.boundSimulationCycle, 500);
	};

	Editor.prototype.stopSimulationInterval = function () {
		clearInterval(this.simulationInterval);
	};

	Editor.prototype.startSimulation = function () {
		var dateObj = window.performance || Date;
		var time = dateObj.now();
		var circuit = this.constructCircuit();
		time = dateObj.now() - time;
		console.log('Constructed circuit in ' + time + 'ms');

		this.simulationCircuit = circuit;

		circuit.init();
		this.startSimulationInterval();

		console.log('simulation started');
	};

	Editor.prototype.stopSimulation = function () {
		this.stopSimulationInterval();

		this.simulationCircuit = null;

		console.log('simulation stopped');
	};

	Editor.prototype.resumeSimulation = function () {
		this.startSimulationInterval();

		console.log('simulation resumed');
	};

	Editor.prototype.pauseSimulation = function () {
		this.stopSimulationInterval();

		console.log('simulation paused');
	};

	return Editor;
});
