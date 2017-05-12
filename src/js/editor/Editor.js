/**
 * Copyright: (c) 2016-2017 Max Klein
 * License: MIT
 */

define([
	'editor/Viewport',
	'editor/EditorTools',
	'editor/Sidebar',
	'editor/Connection',
	'sim/Connection',
	'sim/Circuit',
	'lib/SvgUtil',
	'generated/editorComponents'
], function (Viewport, EditorTools, Sidebar, Connection, SimConnection, SimCircuit, SvgUtil, editorComponents) {
	var MOUSE_UP = 0;
	var MOUSE_PAN = 1;
	var MOUSE_DRAG = 2;
	var MOUSE_SELECT = 3;
	var MOUSE_CONNECT = 4;

	function Editor(app) {
		this.app = app;

		this.tools = new EditorTools(app);
		this.sidebar = new Sidebar(app);
		this.$svg = document.getElementById('editor-svg');
		this.viewport = new Viewport(app, this.$svg);
		this.$selection = document.getElementById('editor-selection');
		this.$componentsGroup = document.getElementById('editor-components');
		this.$connectionsGroup = document.getElementById('editor-connections');
		this.$propertyOverlay = document.getElementById('property-overlay');

		this.mouseMode = MOUSE_UP;
		this.mouseStartX = 0;
		this.mouseStartY = 0;
		this.startX = 0;
		this.startY = 0;
		this.showSidebarOnDrop = false;

		this.selectedComponents = [];
		this.selectedConnections = [];

		this.propertyOverlayVisible = false;

		this.previousTool = null;

		this.connections = [];
		this.currentConnection = null;

		this.components = [];

		this.simulationCircuit = null;
		this.simulationAnimationFrame = null;

		this.registerListeners();
	}

	Editor.prototype.registerListeners = function () {
		var self = this;

		var startX, startY;

		this.$svg.addEventListener('mousedown', function (evt) {
			evt.preventDefault();

			if(self.tools.currentTool === EditorTools.TOOL_PAN) {
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
					self.mouseMode = MOUSE_SELECT;

					if(!evt.shiftKey) {
						self.deselectAll();
					}

					var rect = self.$svg.getBoundingClientRect();
					self.startX = self.viewport.viewportToWorldX(evt.clientX - rect.left);
					self.startY = self.viewport.viewportToWorldY(evt.clientY - rect.top);

					self.$selection.setAttribute('visibility', 'visible');
					self.$selection.setAttribute('x', self.startX);
					self.$selection.setAttribute('y', self.startY);
					self.$selection.setAttribute('width', 0);
					self.$selection.setAttribute('height', 0);
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
					self.currentConnection.display(self.$connectionsGroup);

					self.deselectAll();
					self.selectConnection(self.currentConnection);
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
				} else if(self.mouseMode === MOUSE_DRAG) {
					var scaledDiffX = diffX / self.viewport.scale;
					var scaledDiffY = diffY / self.viewport.scale;

					var offsetX = Math.round(scaledDiffX / 10);
					var offsetY = Math.round(scaledDiffY / 10);

					for(var i = 0; i < self.selectedComponents.length; i++) {
						var component = self.selectedComponents[i];
						component.x = component.startX + offsetX;
						component.y = component.startY + offsetY;
						component.updateDisplay();
					}

					for(var i = 0; i < self.selectedConnections.length; i++) {
						var connection = self.selectedConnections[i];
						connection.x1 = connection.startX1 + offsetX;
						connection.y1 = connection.startY1 + offsetY;
						connection.x2 = connection.startX2 + offsetX;
						connection.y2 = connection.startY2 + offsetY;
						connection.updateDisplay();
					}
				} else if(self.mouseMode === MOUSE_SELECT) {
					var rect = self.$svg.getBoundingClientRect();
					var x = self.viewport.viewportToWorldX(evt.clientX - rect.left);
					var y = self.viewport.viewportToWorldY(evt.clientY - rect.top);

					if(x < self.startX) {
						self.$selection.setAttribute('x', x);
						self.$selection.setAttribute('width', self.startX - x);
					} else {
						self.$selection.setAttribute('x', self.startX);
						self.$selection.setAttribute('width', x - self.startX);
					}

					if(y < self.startY) {
						self.$selection.setAttribute('y', y);
						self.$selection.setAttribute('height', self.startY - y);
					} else {
						self.$selection.setAttribute('y', self.startY);
						self.$selection.setAttribute('height', y - self.startY);
					}
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
				if(self.mouseMode === MOUSE_DRAG) {
					if(self.showSidebarOnDrop) {
						self.showSidebarOnDrop = false;
						self.sidebar.show();
					}
				} else if(self.mouseMode === MOUSE_SELECT) {
					var rect = self.$svg.getBoundingClientRect();
					var x = self.viewport.viewportToWorldX(evt.clientX - rect.left);
					var y = self.viewport.viewportToWorldY(evt.clientY - rect.top);

					var x1, x2;
					if(x < self.startX) {
						x1 = x;
						x2 = self.startX;
					} else {
						x1 = self.startX;
						x2 = x;
					}

					var y1, y2;
					if(y < self.startY) {
						y1 = y;
						y2 = self.startY;
					} else {
						y1 = self.startY;
						y2 = y;
					}

					self.selectRect(x1 / 10, y1 / 10, x2 / 10, y2 / 10);

					self.$selection.setAttribute('visibility', 'hidden');
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
		});

		this.tools.on('action-delete', function () {
			self.deleteSelected();
		});

		this.tools.on('run', function () {
			self.sidebar.hide(true);
			self.$propertyOverlay.classList.remove('visible');

			self.previousTool = self.tools.currentTool;
			self.tools.setTool(EditorTools.TOOL_PAN);
			self.deselectAll();
			self.startSimulation();
		});

		this.tools.on('stop', function () {
			self.stopSimulation();

			self.tools.setTool(self.previousTool);
			self.sidebar.show();
			if(self.propertyOverlayVisible) {
				self.$propertyOverlay.classList.add('visible');
			}
		});

		this.tools.on('step', function () {
			self.stepSimulation();
		});

		this.tools.on('resume', function () {
			self.resumeSimulation();
		});

		this.tools.on('pause', function () {
			self.pauseSimulation();
		});

		this.tools.on('save-file', function () {
			self.saveToFile();
		});

		this.tools.on('load-file', function () {
			self.loadFromFile();
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

			self.deselectAll()
			self.selectComponent(component);

			self.startDragging(evt.clientX, evt.clientY);

			self.showSidebarOnDrop = true;
		});
	};

	Editor.prototype.reset = function () {
		this.tools.stopSimulation();
		this.deselectAll();
		this.deleteAll();
	};

	Editor.prototype.save = function () {
		var components = [];
		for(var i = 0; i < this.components.length; i++) {
			components.push(this.components[i].save());
		}

		var connections = [];
		for(var i = 0; i < this.connections.length; i++) {
			connections.push(this.connections[i].save());
		}

		return {
			components: components,
			connections: connections
		};
	};

	Editor.prototype.saveAsJson = function () {
		return JSON.stringify(this.save());
	};

	Editor.prototype.saveToFile = function () {
		var json = this.saveAsJson();
		var blob = new Blob([json], { type: 'application/json' });
		var blobUrl = URL.createObjectURL(blob);

		var link = document.createElement('a');
		link.download = 'circuit.json';
		link.href = blobUrl;

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(blobUrl);
	};

	var componentConstructorsByType = {};
	for(var i = 0; i < editorComponents.length; i++) {
		var componentConstructor = editorComponents[i];
		var id = componentConstructor.typeName;
		componentConstructorsByType[id] = componentConstructor;
	}

	Editor.prototype.load = function (data) {
		this.reset();

		for(var i = 0; i < data.components.length; i++) {
			var componentData = data.components[i];
			var type = componentData.type;
			if(!componentConstructorsByType.hasOwnProperty(type)) {
				throw new Error('Invalid component type: ' + type);
			}
			var component = new componentConstructorsByType[type]();
			component.load(componentData);
			this.addComponent(component, componentData.x, componentData.y);
		}

		for(var i = 0; i < data.connections.length; i++) {
			var connection = Connection.load(data.connections[i]);
			connection.display(this.$connectionsGroup);
			this.connections.push(connection);
		}

		// TODO: reset viewport (show all?)
	};

	Editor.prototype.loadFromJson = function (json) {
		try {
			this.load(JSON.parse(json));
		} catch(e) {
			console.error(e);
		}
	};

	Editor.prototype.loadFromFile = function () {
		var input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';

		var self = this;
		input.addEventListener('change', function () {
			if(input.files.length === 0) {
				console.log('no file selected');
				return;
			}

			var file = input.files[0];

			var reader = new FileReader();
			reader.addEventListener('load', function () {
				self.loadFromJson(reader.result);
			});
			reader.addEventListener('error', function () {
				console.error(reader.error);
			});
			reader.readAsText(file);
		});

		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
	};

	Editor.prototype.startDragging = function (mouseX, mouseY) {
		this.mouseMode = MOUSE_DRAG;

		this.mouseStartX = mouseX;
		this.mouseStartY = mouseY;

		for(var i = 0; i < this.selectedComponents.length; i++) {
			var component = this.selectedComponents[i];
			component.startX = component.x;
			component.startY = component.y;
		}

		for(var i = 0; i < this.selectedConnections.length; i++) {
			var connection = this.selectedConnections[i];
			connection.startX1 = connection.x1;
			connection.startY1 = connection.y1;
			connection.startX2 = connection.x2;
			connection.startY2 = connection.y2;
		}

		this.$svg.style.cursor = 'move';
	};

	Editor.prototype.updatePropertyOverlay = function () {
		var found = false;
		if(this.selectedComponents.length === 1) {
			var component = this.selectedComponents[0];
			if(component.properties && component.properties.length > 0) {
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

	Editor.prototype.selectComponent = function (component) {
		component.select();
		this.selectedComponents.push(component);

		this.updatePropertyOverlay();
	};

	Editor.prototype.selectConnection = function (connection) {
		connection.select();
		this.selectedConnections.push(connection);

		this.updatePropertyOverlay();
	};

	Editor.prototype.selectRect = function (x1, y1, x2, y2) {
		for(var i = 0; i < this.components.length; i++) {
			var component = this.components[i];
			if(!component.selected) {
				if(component.x < x2 && component.y < y2 && component.x + component.width > x1 && component.y + component.height > y1) {
					component.select();
					this.selectedComponents.push(component);
				}
			}
		}

		for(var i = 0; i < this.connections.length; i++) {
			var connection = this.connections[i];
			if(!connection.selected) {
				if(connection.x1 < x2 && connection.y1 < y2 && connection.x2 > x1 && connection.y2 > y1
					// In case the connection has been draw in reverse
					|| connection.x1 > x1 && connection.y1 > y1 && connection.x2 < x2 && connection.y2 < y2) {
					connection.select();
					this.selectedConnections.push(connection);
				}
			}
		}

		this.updatePropertyOverlay();
	};

	Editor.prototype.deselectComponent = function (component) {
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

		for(var i = 0; i < this.selectedConnections.length; i++) {
			var connection = this.selectedConnections[i];
			connection.deselect();
		}
		this.selectedConnections.length = 0;

		this.updatePropertyOverlay();
	};

	Editor.prototype.deleteAll = function () {
		var n = this.components.length;
		while(n--) {
			var component = this.components[n];
			this.deleteComponent(component);
		}

		var n = this.connections.length;
		while(n--) {
			var connection = this.connections[n];
			this.deleteConnection(connection);
		}
	};

	Editor.prototype.deleteSelected = function () {
		for(var i = 0; i < this.selectedComponents.length; i++) {
			var component = this.selectedComponents[i];
			this.deleteComponent(component);
		}

		for(var i = 0; i < this.selectedConnections.length; i++) {
			var connection = this.selectedConnections[i];
			this.deleteConnection(connection);
		}

		this.deselectAll();
	};

	Editor.prototype.deleteComponent = function (component) {
		var index = this.components.indexOf(component);
		if(index !== -1) {
			this.components.splice(index, 1);
			component.remove();
		}
	};

	Editor.prototype.deleteConnection = function (connection) {
		var index = this.connections.indexOf(connection);
		if(index !== -1) {
			this.connections.splice(index, 1);
			connection.remove();
		}
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
				if(self.tools.currentTool === EditorTools.TOOL_SELECT) {
					if(self.mouseMode === MOUSE_UP) {
						if(evt.shiftKey) {
							if(component.selected) {
								self.deselectComponent(component);
								// TODO: dont't drag anything
							} else {
								self.selectComponent(component);
							}
						} else {
							if(component.selected) {

							} else {
								self.deselectAll();
								self.selectComponent(component);
							}
						}

						self.startDragging(evt.clientX, evt.clientY);
					}
				}
			}
		}

		component.display(this.$componentsGroup, mousedown);
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

	Editor.prototype.initSimulationDisplay = function () {
		var simComponents = this.simulationCircuit.components;
		for(var i = 0; i < simComponents.length; i++) {
			var simComponent = simComponents[i];

			var component = simComponent.userData;
			if(component.initSimulationDisplay) {
				component.initSimulationDisplay(simComponent);
			}
		}
	};

	Editor.prototype.updateSimulationDisplay = function () {
		var simConnections = this.simulationCircuit.connections;
		for(var i = 0; i < simConnections.length; i++) {
			var simConnection = simConnections[i];

			var connections = simConnection.userData;
			for(var j = 0; j < connections.length; j++) {
				var connection = connections[j];
				connection.setState(simConnection.value ? Connection.ACTIVE : Connection.DEFAULT);
			}
		}

		var simComponents = this.simulationCircuit.components;
		for(var i = 0; i < simComponents.length; i++) {
			var simComponent = simComponents[i];

			var component = simComponent.userData;
			if(component.updateSimulationDisplay) {
				component.updateSimulationDisplay(simComponent);
			}
		}
	};

	Editor.prototype.resetSimulationDisplay = function () {
		var simConnections = this.simulationCircuit.connections;
		for(var i = 0; i < simConnections.length; i++) {
			var simConnection = simConnections[i];

			var connections = simConnection.userData;
			for(var j = 0; j < connections.length; j++) {
				var connection = connections[j];
				connection.setState(Connection.DEFAULT);
			}
		}

		var simComponents = this.simulationCircuit.components;
		for(var i = 0; i < simComponents.length; i++) {
			var simComponent = simComponents[i];

			var component = simComponent.userData;
			if(component.resetSimulationDisplay) {
				component.resetSimulationDisplay(simComponent);
			}
		}
	};

	Editor.prototype.simulationCycle = function () {
		this.simulationCircuit.cycle();
		this.updateSimulationDisplay();
	};

	Editor.prototype.startSimulationInterval = function () {
		var self = this;
		function update() {
			self.simulationAnimationFrame = requestAnimationFrame(update);

			self.simulationCycle();
		}

		this.simulationAnimationFrame = requestAnimationFrame(update);
	};

	Editor.prototype.stopSimulationInterval = function () {
		cancelAnimationFrame(this.simulationAnimationFrame);
	};

	Editor.prototype.startSimulation = function () {
		var dateObj = window.performance || Date;
		var time = dateObj.now();
		var circuit = this.constructCircuit();
		time = dateObj.now() - time;
		console.log('Constructed circuit in ' + time + 'ms');

		this.simulationCircuit = circuit;

		circuit.init();

		this.initSimulationDisplay();
		this.updateSimulationDisplay();

		this.startSimulationInterval();
	};

	Editor.prototype.stopSimulation = function () {
		this.stopSimulationInterval();

		this.resetSimulationDisplay();

		this.simulationCircuit = null;
	};

	Editor.prototype.stepSimulation = function () {
		this.simulationCycle();
	};

	Editor.prototype.resumeSimulation = function () {
		this.startSimulationInterval();
	};

	Editor.prototype.pauseSimulation = function () {
		this.stopSimulationInterval();
	};

	return Editor;
});
