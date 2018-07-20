/**
 * Copyright: (c) 2016-2018 Max Klein
 * License: MIT
 */

define([
	'editor/Viewport',
	'editor/EditorTools',
	'editor/Sidebar',
	'editor/EditorDialogs',
	'editor/Connection',
	'editor/Joint',
	'editor/Circuit',
	'sim/Simulator',
	'lib/SvgUtil',
	'generated/editorComponents'
], function (Viewport, EditorTools, Sidebar, EditorDialogs, Connection, Joint, Circuit, Simulator, SvgUtil, editorComponents) {
	var MOUSE_UP = 0;
	var MOUSE_PAN = 1;
	var MOUSE_DRAG = 2;
	var MOUSE_SELECT = 3;
	var MOUSE_CONNECT = 4;

	function Editor(app) {
		this.app = app;

		this.tools = new EditorTools(app);
		this.sidebar = new Sidebar(app);
		this.dialogs = new EditorDialogs(app);
		this.$svg = document.getElementById('editor-svg');
		this.viewport = new Viewport(app, this.$svg);
		this.$selection = document.getElementById('editor-selection');
		this.$componentsGroup = document.getElementById('editor-components');
		this.$connectionsGroup = document.getElementById('editor-connections');
		this.$jointsGroup = document.getElementById('editor-joints');
		this.$propertyOverlay = document.getElementById('property-overlay');

		this.mouseMode = MOUSE_UP;
		this.mouseStartX = 0;
		this.mouseStartY = 0;
		this.startX = 0;
		this.startY = 0;
		this.showSidebarOnDrop = false;

		this.components = [];
		this.selectedComponents = [];
		this.newComponent = null;

		this.connections = [];
		this.selectedConnections = [];
		this.currentConnection = null;

		this.circuit = new Circuit(this.components, this.connections);
		this.circuitName = 'main';
		this.circuits = { 'main': this.circuit };

		this.joints = [];
		this.jointsByCoord = {};
		this.selectedJoints = [];

		this.propertyOverlayVisible = false;

		this.previousTool = null;

		this.simulator = new Simulator();
		var self = this;
		this.simulator.stepCallback = function () {
			self.updateSimulationDisplay();
		};
		this.simulationAnimationFrame = null;

		this.registerListeners();

		this.updateCircuitsList();

		this.start();
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

					for(var i = 0; i < self.selectedJoints.length; i++) {
						var joint = self.selectedJoints[i];
						// Moving a joint requires updating the hash in jointsByCoord
						delete self.jointsByCoord[joint.x + '|' + joint.y];
						joint.x = joint.startX + offsetX;
						joint.y = joint.startY + offsetY;
						self.jointsByCoord[joint.x + '|' + joint.y] = joint;
						joint.updateDisplay();
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
					if (self.showSidebarOnDrop) {
						self.showSidebarOnDrop = false;
						self.sidebar.show();
					}

					if (self.newComponent !== null) {
						if (self.newComponent.isCustom) {
							self.dialogs.open('choose-custom-component', {
								circuitNames: self.getCircuitNames(true)
							});
						}
					}

					self.updateJoints();
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

					self.updateJoints();
				} else if(self.mouseMode === MOUSE_CONNECT) {
					if(self.currentConnection.x1 !== self.currentConnection.x2 || self.currentConnection.y1 !== self.currentConnection.y2) {
						self.connections.push(self.currentConnection);

						var x1 = self.currentConnection.x1;
						var y1 = self.currentConnection.y1;
						var x2 = self.currentConnection.x2;
						var y2 = self.currentConnection.y2;

						// Split existing connections at the endpoints
						self.splitConnections(x1, y1);
						self.splitConnections(x2, y2);
						// Merge/split all connections connected to the new one
						self.fixupConnections(x1, y1, x2, y2);

						self.updateJoints();
					} else {
						var x = self.currentConnection.x1;
						var y = self.currentConnection.y1;

						self.currentConnection.remove();

						self.toggleJoint(x, y);
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

			self.updateJoints();
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

		this.tools.on('new-file', function () {
			self.dialogs.open('new');
		});

		this.tools.on('save-file', function () {
			self.saveToFile();
		});

		this.tools.on('load-file', function () {
			self.dialogs.open('open');
		});

		this.tools.on('show-help', function () {
			self.dialogs.setWelcomeShowAgain(!this.app.storage.get('Editor:welcome-displayed'));
			self.dialogs.open('welcome');
		});

		this.tools.on('new-circuit', function () {
			var hasSelection = self.selectedComponents.length > 0 || self.selectedConnections.length > 0;
			self.dialogs.open('new-circuit', hasSelection);
		});

		this.tools.on('select-circuit', function (circuitName) {
			try {
				self.openCircuit(circuitName);
			} catch (e) {
				console.error(e);
			}
		});

		this.tools.on('edit-circuit', function () {
			self.dialogs.open('edit-circuit', {
				name: self.circuitName,
				label: self.circuit.label
			});
		});

		this.dialogs.on('load-url', function (url) {
			self.dialogs.displayOpenLoading(true);
			self.loadFromUrl(url);
		});

		this.dialogs.on('load-file', function (file) {
			self.dialogs.displayOpenLoading(true);
			self.loadFromFile(file);
		});

		this.dialogs.on('new', function () {
			self.reset();
			self.viewport.reset();
			self.dialogs.close();
		});

		this.dialogs.on('welcome-closed', function (showAgain) {
			self.app.storage.set('Editor:welcome-displayed', !showAgain);
		});

		this.dialogs.on('new-circuit', function (name, label, moveSelection) {
			try {
				self.createNewCircuit(name, label, moveSelection);
			} catch (e) {
				self.dialogs.displayNewCircuitError(e.toString());
				return;
			}

			self.openCircuit(name);

			self.dialogs.close();
		});

		this.dialogs.on('edit-circuit', function (name, label) {
			try {
				self.renameCircuit(self.circuitName, name);
			} catch (e) {
				self.dialogs.displayEditCircuitError(e.toString());
				return;
			}

			self.circuit.label = label;

			self.dialogs.close();
		});

		this.dialogs.on('delete-circuit', function () {
			try {
				self.deleteCircuit(self.circuitName);
			} catch (e) {
				self.dialogs.displayEditCircuitError(e.toString());
				return;
			}

			self.dialogs.close();
		});

		this.dialogs.on('choose-custom-component-selected', function (circuitName) {
			if (self.circuits.hasOwnProperty(circuitName)) {
				// findNestedCircuit performs a depth-first search for a circuit inside another one
				function findNestedCircuit(circuitName, searchedName, chain) {
					if (circuitName === searchedName) {
						chain.push(searchedName);
						return {
							parentName: circuitName,
							chain: chain
						};
					}

					var circuit = self.circuits[circuitName];

					chain.push(circuitName);

					for (var i = 0; i < circuit.components.length; i++) {
						var component = circuit.components[i];

						if (component.isCustom && component.circuitName !== null) {
							if (component.circuitName === searchedName) {
								chain.push(searchedName);
								return {
									parentName: circuitName,
									chain: chain
								};
							}

							var result = findNestedCircuit(component.circuitName, searchedName, chain);
							if (result !== null) {
								return result;
							}
						}
					}

					chain.pop();

					return null;
				}

				// Search for the current circuit inside the newly added components circuit
				var result = findNestedCircuit(circuitName, self.circuitName, []);
				if (result !== null) {
					result.chain.push(circuitName);
					var chainText = '\'' + result.chain.join('\' → \'') + '\'';
					self.dialogs.displayChooseCustomComponentError('Component would be nested inside itself, via this chain: ' + chainText);
				} else {
					self.newComponent.setCircuit(circuitName);
					self.newComponent = null;
					self.dialogs.close();
				}
			} else {
				self.dialogs.displayChooseCustomComponentError('Circuit \'' + circuitName + '\' does not exist');
			}
		});

		this.dialogs.on('choose-custom-component-cancelled', function () {
			self.deselectComponent(self.newComponent);
			self.deleteComponent(self.newComponent);
			self.newComponent = null;
		});

		this.sidebar.on('component-mousedown', function (evt, entry) {
			self.sidebar.hide();

			var rect = self.$svg.getBoundingClientRect();
			var x = self.viewport.viewportToWorldX(evt.clientX - rect.left);
			var y = self.viewport.viewportToWorldY(evt.clientY - rect.top);

			var snappedX = Math.round(x / 10);
			var snappedY = Math.round(y / 10);

			var component = new entry.ctor(self.app);
			self.addComponent(component, snappedX, snappedY);

			self.deselectAll()
			self.selectComponent(component);

			self.startDragging(evt.clientX, evt.clientY);

			self.showSidebarOnDrop = true;

			self.newComponent = component;
		});
	};

	Editor.prototype.start = function () {
		if (!this.app.storage.get('Editor:welcome-displayed')) {
			this.dialogs.open('welcome');
		}
	};

	Editor.prototype.reset = function () {
		this.tools.stopSimulation();
		this.deselectAll();
		this.deleteAll();

		this.components = [];
		this.selectedComponents = [];

		this.connections = [];
		this.selectedConnections = [];
		this.currentConnection = null;

		this.joints = [];
		this.jointsByCoord = {};
		this.selectedJoints = [];

		this.circuit = new Circuit(this.components, this.connections);
		this.circuitName = 'main';
		this.circuits = { 'main': this.circuit };

		this.updateCircuitsList();
	};

	Editor.prototype.resetCircuit = function () {
		this.tools.stopSimulation();
		this.deselectAll();
		this.undisplayAll();
	};

	Editor.prototype.getCircuitNames = function (excludeMain) {
		var circuitNames = [];

		for (var circuitName in this.circuits) {
			if (this.circuits.hasOwnProperty(circuitName)) {
				if (circuitName === 'main') {
					if (!excludeMain) {
						circuitNames.push({
							key:'main',
							pretty: 'Main'
						});
					}
				} else {
					circuitNames.push({
						key: circuitName,
						pretty: circuitName
					});
				}
			}
		}

		circuitNames.sort(function (a, b) {
			return (a.pretty < b.pretty) ? -1 : ((a.pretty > b.pretty) ? 1 : 0);
		});

		return circuitNames;
	};

	Editor.prototype.save = function () {
		var data = {};

		data.version = 1;
		
		var circuits = [];

		for (var name in this.circuits) {
			if (this.circuits.hasOwnProperty(name)) {
				var circuit = this.circuits[name];

				var components = [];
				for (var i = 0; i < circuit.components.length; i++) {
					components.push(circuit.components[i].save());
				}

				var connections = [];
				for (var i = 0; i < circuit.connections.length; i++) {
					connections.push(circuit.connections[i].save());
				}

				circuits.push({
					name: name,
					label: circuit.label,
					components: components,
					connections: connections
				});
			}
		}

		data.circuits = circuits;

		return data;
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

	Editor.prototype.updateCircuitsList = function () {
		var circuitNames = this.getCircuitNames(false);
		this.tools.updateCircuitsList(circuitNames, this.circuitName);
	};

	Editor.prototype.openCircuit = function (name) {
		if (!this.circuits.hasOwnProperty(name)) {
			throw new Error('Circuit \'' + name + '\' does not exist');
		}

		this.resetCircuit();

		var circuit = this.circuits[name];

		this.circuit = circuit;
		this.circuitName = name;
		this.components = circuit.components;
		this.connections = circuit.connections;

		for (var i = 0; i < circuit.components.length; i++) {
			var component = circuit.components[i];

			this.displayComponent(component);
		}

		for (var i = 0; i < circuit.connections.length; i++) {
			var connection = circuit.connections[i];

			this.displayConnection(connection);
		}

		this.updateJoints();

		this.viewport.reset();

		this.tools.selectCircuit(name);
	};

	Editor.prototype.createNewCircuit = function (name, label, moveSelection) {
		if (this.circuits.hasOwnProperty(name)) {
			throw new Error('A circuit with the name \'' + name + '\' already exists');
		}

		var newComponents = [];
		var newConnections = [];

		if (moveSelection) {
			var selectedComponents = this.selectedComponents.slice();
			var selectedConnections = this.selectedConnections.slice();

			this.deselectAll();

			for (var i = 0; i < selectedComponents.length; i++) {
				var component = selectedComponents[i];

				newComponents.push(component);

				this.deleteComponent(component);
			}

			for (var i = 0; i < selectedConnections.length; i++) {
				var connection = selectedConnections[i];

				newConnections.push(connection);

				this.deleteConnection(connection);
			}
		}

		var circuit = new Circuit(newComponents, newConnections);
		circuit.label = label;

		this.circuits[name] = circuit;

		this.updateCircuitsList();
	};

	Editor.prototype.deleteCircuit = function (name) {
		var circuitNamesMap = {};
		for (var circuitName in this.circuits) {
			if (this.circuits.hasOwnProperty(circuitName)) {
				var circuit = this.circuits[circuitName];

				for (var i = 0; i < circuit.components.length; i++) {
					var component = circuit.components[i];

					if (component.isCustom && component.circuitName === name) {
						circuitNamesMap[circuitName] = true;
					}
				}
			}
		}

		var circuitNames = [];
		for (var circuitName in circuitNamesMap) {
			if (circuitNamesMap.hasOwnProperty(circuitName)) {
				circuitNames.push(circuitName);
			}
		}

		if (circuitNames.length > 0) {
			var circuitNamesStr = '\'' + circuitNames.join('\', \'') + '\'';
			throw new Error('Circuit \'' + name + '\' can\'t be deleted because it is used in other circuits: ' + circuitNamesStr);
		}

		this.openCircuit('main');
		delete this.circuits[name];

		this.updateCircuitsList();
	};

	Editor.prototype.renameCircuit = function (oldName, newName) {
		if (newName === oldName) {
			return;
		}

		if (this.circuits.hasOwnProperty(newName)) {
			throw new Error('A circuit with the name \'' + newName + '\' already exists');
		}

		this.circuits[newName] = this.circuit;
		delete this.circuits[oldName];
		this.circuitName = newName;

		for (var name in this.circuits) {
			if (this.circuits.hasOwnProperty(name)) {
				var circuit = this.circuits[name];

				for (var i = 0; i < circuit.components.length; i++) {
					var component = circuit.components[i];

					if (component.isCustom && component.circuitName === oldName) {
						component.setCircuit(newName);
					}
				}
			}
		}

		this.updateCircuitsList();
	};

	var componentConstructorsByType = {};
	for(var i = 0; i < editorComponents.length; i++) {
		var componentConstructor = editorComponents[i];
		var id = componentConstructor.typeName;
		componentConstructorsByType[id] = componentConstructor;
	}

	Editor.prototype.load = function (data) {
		var self = this;
		function loadCircuit(componentsData, connectionsData, label) {
			var components = [];
			var connections = [];

			for (var i = 0; i < componentsData.length; i++) {
				var componentData = componentsData[i];

				var type = componentData.type;
				if(!componentConstructorsByType.hasOwnProperty(type)) {
					throw new Error('Invalid component type: ' + type);
				}

				var component = new componentConstructorsByType[type](self.app);
				component.load(componentData);

				components.push(component);
			}

			for (var i = 0; i < connectionsData.length; i++) {
				var connection = Connection.load(connectionsData[i]);

				connections.push(connection);
			}

			var circuit = new Circuit(components, connections);
			circuit.label = label;

			return circuit;
		}

		var circuits = {};

		if (data.hasOwnProperty('version')) {
			var version = data.version;
			if (version !== 1) {
				throw new Error('Version ' + version + ' not supported');
			}

			var circuitsData = data.circuits;

			for (var i = 0; i < circuitsData.length; i++) {
				var circuitData = circuitsData[i];

				var circuit = loadCircuit(circuitData.components, circuitData.connections, circuitData.label);
				circuits[circuitData.name] = circuit;
			}

			if (!circuits.hasOwnProperty('main')) {
				throw new Error('File contains no main circuit');
			}
		} else {
			circuits['main'] = loadCircuit(data.components, data.connections);
		}

		this.reset();

		this.circuits = circuits;

		this.updateCircuitsList();

		this.openCircuit('main');
	};

	Editor.prototype.loadFromJson = function (json) {
		try {
			this.load(JSON.parse(json));
			this.dialogs.close();
		} catch (e) {
			this.dialogs.displayOpenError(e);
		}
	};

	Editor.prototype.loadFromFile = function (file) {
		var reader = new FileReader();

		var self = this;
		reader.addEventListener('load', function () {
			self.loadFromJson(reader.result);
		});

		reader.addEventListener('error', function () {
			self.dialogs.displayOpenError(reader.error);
		});

		reader.readAsText(file);
	};

	Editor.prototype.loadFromUrl = function (url) {
		var req = new XMLHttpRequest();

		var self = this;
		req.addEventListener('load', function () {
			if (req.status === 200) {
				self.loadFromJson(req.responseText);
			} else {
				self.dialogs.displayOpenError('Server error: ' + req.status);
			}
		});

		req.addEventListener('error', function () {
			self.dialogs.displayOpenError('Client/network error');
		});

		req.open('GET', url);
		req.send();
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

		for(var i = 0; i < this.selectedJoints.length; i++) {
			var joint = this.selectedJoints[i];
			joint.startX = joint.x;
			joint.startY = joint.y;
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

	// For use in a bitfield
	var CONNECTION_RIGHT = 1 << 0;
	var CONNECTION_DOWN = 1 << 1;
	var CONNECTION_LEFT = 1 << 2;
	var CONNECTION_UP = 1 << 3;

	// Determine whether a joint is needed if there are connections coming from specific directions
	function needJoint(directionBits) {
		var right = !!(directionBits & CONNECTION_RIGHT);
		var down = !!(directionBits & CONNECTION_DOWN);
		var left = !!(directionBits & CONNECTION_LEFT);
		var up = !!(directionBits & CONNECTION_UP);
		var count = right + down + left + up;
		return count > 2;
	}

	// Add/remove joints appropriately for the whole circuit
	Editor.prototype.updateJoints = function () {
		var connectionDirections = {};

		for (var i = 0; i < this.connections.length; i++) {
			var connection = this.connections[i];
			var p1 = connection.x1 + '|' + connection.y1;
			var p2 = connection.x2 + '|' + connection.y2;

			if (!connectionDirections.hasOwnProperty(p1)) {
				connectionDirections[p1] = 0;
			}

			if (!connectionDirections.hasOwnProperty(p2)) {
				connectionDirections[p2] = 0;
			}
			
			if (connection.y1 === connection.y2) {
				// Horizontal

				if (connection.x1 < connection.x2) {
					connectionDirections[p1] |= CONNECTION_RIGHT;
					connectionDirections[p2] |= CONNECTION_LEFT;
				} else {
					connectionDirections[p1] |= CONNECTION_LEFT;
					connectionDirections[p2] |= CONNECTION_RIGHT;
				}
			} else {
				// Vertical

				if (connection.y1 < connection.y2) {
					connectionDirections[p1] |= CONNECTION_DOWN;
					connectionDirections[p2] |= CONNECTION_UP;
				} else {
					connectionDirections[p1] |= CONNECTION_UP;
					connectionDirections[p2] |= CONNECTION_DOWN;
				}
			}
		}

		for (var p in connectionDirections) {
			if (connectionDirections.hasOwnProperty(p)) {
				var directionBits = connectionDirections[p];
				if (directionBits !== 0) {
					var xy = p.split('|');
					var x = parseInt(xy[0]);
					var y = parseInt(xy[1]);

					for (var i = 0; i < this.connections.length; i++) {
						var connection = this.connections[i];
						
						if (connection.y1 === connection.y2) {
							// Horizontal
							if (connection.y1 === y
								&& (connection.x1 < x && connection.x2 > x || connection.x2 < x && connection.x1 > x)) {
								// Left & right
								directionBits |= CONNECTION_LEFT | CONNECTION_RIGHT;
							}
						} else {
							// Vertical
							if (connection.x1 === x
								&& (connection.y1 < y && connection.y2 > y || connection.y2 < y && connection.y1 > y)) {
								// Up & down
								directionBits |= CONNECTION_UP | CONNECTION_DOWN;
							}
						}
					}

					connectionDirections[p] = directionBits;
				}
			}
		}

		var usedJoints = {};

		for (var p in connectionDirections) {
			if (connectionDirections.hasOwnProperty(p)) {
				var directionBits = connectionDirections[p];
				if (needJoint(directionBits)) {
					if (this.jointsByCoord.hasOwnProperty(p)) {
						this.jointsByCoord[p].display(this.$jointsGroup);
					} else {
						var xy = p.split('|');
						var x = parseInt(xy[0]);
						var y = parseInt(xy[1]);

						this.addJoint(x, y);
					}

					usedJoints[p] = true;
				}
			}
		}

		for (var p in this.jointsByCoord) {
			if (this.jointsByCoord.hasOwnProperty(p)) {
				if (!usedJoints.hasOwnProperty(p)) {
					var xy = p.split('|');
					var x = parseInt(xy[0]);
					var y = parseInt(xy[1]);

					this.deleteJoint(x, y);
				}
			}
		}
	};

	// Split all connections that cross this point (at that point)
	Editor.prototype.splitConnections = function (x, y) {
		var n = this.connections.length;
		while (n--) {
			var connection = this.connections[n];

			var x1 = connection.x1;
			var y1 = connection.y1;
			var x2 = connection.x2;
			var y2 = connection.y2;

			var horizontal = y1 === y2;

			var minX = Math.min(x1, x2);
			var maxX = Math.max(x1, x2);
			var minY = Math.min(y1, y2);
			var maxY = Math.max(y1, y2);

			if (horizontal) {
				if (y === minY) {
					if (x > minX && x < maxX) {
						this.deleteConnection(connection);
						this.addConnection(minX, minY, x, minY);
						this.addConnection(x, minY, maxX, minY);
					}
				}
			} else {
				if (x === minX) {
					if (y > minY && y < maxY) {
						this.deleteConnection(connection);
						this.addConnection(minX, minY, minX, y);
						this.addConnection(minX, y, minX, maxY);
					}
				}
			}
		}
	};

	// Merge same-orientation connections ending at a specific point
	Editor.prototype.mergeConnections = function (x, y) {
		var connectionsToMerge = [];

		var minX = x;
		var maxX = x;
		var minY = y;
		var maxY = y;

		var horizontal = false, vertical = false;

		for (var i = 0; i < this.connections.length; i++) {
			var connection = this.connections[i];

			if (connection.x1 === x && connection.y1 === y || connection.x2 === x && connection.y2 === y) {
				if (connection.y1 === connection.y2) {
					if (vertical) {
						// If not all connections are the same orientation, we can't merge them
						return;
					}

					horizontal = true;

					minX = Math.min(minX, connection.x1, connection.x2);
					maxX = Math.max(maxX, connection.x1, connection.x2);
					connectionsToMerge.push(connection);
				} else {
					if (horizontal) {
						// If not all connections are the same orientation, we can't merge them
						return;
					}

					vertical = true;

					minY = Math.min(minY, connection.y1, connection.y2);
					maxY = Math.max(maxY, connection.y1, connection.y2);
					connectionsToMerge.push(connection);
				}
			}
		}

		if (horizontal || vertical) {
			for (var i = 0; i < connectionsToMerge.length; i++) {
				this.deleteConnection(connectionsToMerge[i]);
			}

			this.addConnection(minX, minY, maxX, maxY);
		}
	};

	// Merge connections adjacent to a new one, and split them into parts where a joint is needed
	Editor.prototype.fixupConnections = function (x1, y1, x2, y2) {
		// Merge
		var connectionsToMerge = [];

		var horizontal = y1 === y2;

		var minX = Math.min(x1, x2);
		var maxX = Math.max(x1, x2);
		var minY = Math.min(y1, y2);
		var maxY = Math.max(y1, y2);

		var startX = minX;
		var startY = minY;
		var endX = maxX;
		var endY = maxY;

		for (var i = 0; i < this.connections.length; i++) {
			var connection = this.connections[i];

			if (horizontal) {
				// On same line?
				if (connection.y1 === y1 && connection.y2 === y1) {
					var connectionMinX = Math.min(connection.x1, connection.x2);
					var connectionMaxX = Math.max(connection.x1, connection.x2);

					// Intersecting?
					if (connectionMinX <= maxX && connectionMaxX >= minX) {
						if (connectionMinX < startX) {
							startX = connectionMinX;
						}
						if (connectionMaxX > endX) {
							endX = connectionMaxX;
						}
						connectionsToMerge.push(connection);
					}
				}
			} else {
				// On same line?
				if (connection.x1 === x1 && connection.x2 === x1) {
					var connectionMinY = Math.min(connection.y1, connection.y2);
					var connectionMaxY = Math.max(connection.y1, connection.y2);

					// Intersecting?
					if (connectionMinY <= maxY && connectionMaxY >= minY) {
						if (connectionMinY < startY) {
							startY = connectionMinY;
						}
						if (connectionMaxY > endY) {
							endY = connectionMaxY;
						}
						connectionsToMerge.push(connection);
					}
				}
			}
		}

		for (var i = 0; i < connectionsToMerge.length; i++) {
			this.deleteConnection(connectionsToMerge[i]);
		}

		// Split
		var splitPoints = {};

		function checkSplitPoint(x, y) {
			if (horizontal) {
				if (y === startY && x > startX && x < endX) {
					splitPoints[x + '|' + y] = { x: x, y: y };
				}
			} else {
				if (x === startX && y > startY && y < endY) {
					splitPoints[x + '|' + y] = { x: x, y: y };
				}
			}
		}

		for (var i = 0; i < this.connections.length; i++) {
			var connection = this.connections[i];

			if (horizontal && connection.x1 === connection.x2 || !horizontal && connection.y1 === connection.y2) {
				checkSplitPoint(connection.x1, connection.y1);
				checkSplitPoint(connection.x2, connection.y2);
			}
		}

		var splitPointDistances = [];

		for (var p in splitPoints) {
			if (splitPoints.hasOwnProperty(p)) {
				if (horizontal) {
					splitPointDistances.push(splitPoints[p].x - startX);
				} else {
					splitPointDistances.push(splitPoints[p].y - startY);
				}
			}
		}

		if (horizontal) {
			splitPointDistances.push(endX - startX);
		} else {
			splitPointDistances.push(endY - startY);
		}

		splitPointDistances.sort(function (a, b) {
			return a - b;
		});

		var lastDistance = 0;
		for (var i = 0; i < splitPointDistances.length; i++) {
			var distance = splitPointDistances[i];

			if (horizontal) {
				this.addConnection(startX + lastDistance, startY, startX + distance, startY);
			} else {
				this.addConnection(startX, startY + lastDistance, startX, startY + distance);
			}

			lastDistance = distance;
		}
	};

	// Toggle a joint at a "4-way crossing"
	Editor.prototype.toggleJoint = function (x, y) {
		var endingConnectionsHorizontal = [];
		var endingConnectionsVertical = [];

		var crossingHorizontal = false, crossingVertical = false;

		var minX = x;
		var maxX = x;
		var minY = y;
		var maxY = y;

		for (var i = 0; i < this.connections.length; i++) {
			var connection = this.connections[i];

			if (connection.y1 === connection.y2) {
				if (connection.y1 === y) {
					if (connection.x1 === x) {
						if (connection.x2 < x) {
							minX = Math.min(minX, connection.x2);
						} else {
							maxX = Math.max(maxX, connection.x2);
						}

						endingConnectionsHorizontal.push(connection);
					} else if (connection.x2 === x) {
						if (connection.x1 < x) {
							minX = Math.min(minX, connection.x1);
						} else {
							maxX = Math.max(maxX, connection.x1);
						}

						endingConnectionsHorizontal.push(connection);
					} else if (connection.x1 < x && connection.x2 > x || connection.x2 < x && connection.x1 > x) {
						crossingHorizontal = true;
					}
				}
			} else {
				if (connection.x1 === x) {
					if (connection.y1 === y) {
						if (connection.y2 < y) {
							minY = Math.min(minY, connection.y2);
						} else {
							maxY = Math.max(maxY, connection.y2);
						}

						endingConnectionsVertical.push(connection);
					} else if (connection.y2 === y) {
						if (connection.y1 < y) {
							minY = Math.min(minY, connection.y1);
						} else {
							maxY = Math.max(maxY, connection.y1);
						}

						endingConnectionsVertical.push(connection);
					} else if (connection.y1 < y && connection.y2 > y || connection.y2 < y && connection.y1 > y) {
						crossingVertical = true;
					}
				}
			}
		}

		if (endingConnectionsHorizontal.length > 0 && endingConnectionsVertical.length > 0) {
			if (minX < x && maxX > x && minY < y && maxY > y) {
				for (var i = 0; i < endingConnectionsHorizontal.length; i++) {
					this.deleteConnection(endingConnectionsHorizontal[i]);
				}

				for (var i = 0; i < endingConnectionsVertical.length; i++) {
					this.deleteConnection(endingConnectionsVertical[i]);
				}

				this.addConnection(minX, y, maxX, y);
				this.addConnection(x, minY, x, maxY);

				this.deleteJoint(x, y);
			}
		} else if (crossingHorizontal && crossingVertical) {
			this.splitConnections(x, y);
			this.addJoint(x, y);
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

		for (var i = 0; i < this.joints.length; i++) {
			var joint = this.joints[i];
			if(!joint.selected) {
				if(joint.x > x1 && joint.x < x2 && joint.y > y1 && joint.y < y2) {
					joint.select();
					this.selectedJoints.push(joint);
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

		for(var i = 0; i < this.selectedJoints.length; i++) {
			var joint = this.selectedJoints[i];
			joint.deselect();
		}
		this.selectedJoints.length = 0;

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

		var n = this.joints.length;
		while(n--) {
			var joint = this.joints[n];
			this.deleteJoint(joint.x, joint.y);
		}
	};

	Editor.prototype.deleteSelected = function () {
		for(var i = 0; i < this.selectedComponents.length; i++) {
			var component = this.selectedComponents[i];
			this.deleteComponent(component);
		}

		// We need to merge connections where an ending point has been removed
		var connectionMergePoints = [];

		for(var i = 0; i < this.selectedConnections.length; i++) {
			var connection = this.selectedConnections[i];
			connectionMergePoints.push(
				[ connection.x1, connection.y1 ],
				[ connection.x2, connection.y2 ]
			);
			this.deleteConnection(connection);
		}

		this.deselectAll();

		for (var i = 0; i < connectionMergePoints.length; i++) {
			var p = connectionMergePoints[i];
			this.mergeConnections(p[0], p[1]);
		}
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

	// Delete a joint both in joints and jointsByCoord
	Editor.prototype.deleteJoint = function (x, y) {
		var p = x + '|' + y;
		if (this.jointsByCoord.hasOwnProperty(p)) {
			var joint = this.jointsByCoord[p];

			delete this.jointsByCoord[p];

			var index = this.joints.indexOf(joint);
			if(index !== -1) {
				this.joints.splice(index, 1);
				joint.remove();
			}
		}
	};

	Editor.prototype.undisplayAll = function () {
		var n = this.components.length;
		while(n--) {
			var component = this.components[n];
			component.remove();
		}

		var n = this.connections.length;
		while(n--) {
			var connection = this.connections[n];
			connection.remove();
		}

		var n = this.joints.length;
		while(n--) {
			var joint = this.joints[n];
			joint.remove();
		}
	};

	Editor.prototype.onComponentMousedown = function (component, evt) {
		evt.preventDefault();

		if(this.tools.running) {
			//
		} else {
			if(this.tools.currentTool === EditorTools.TOOL_SELECT) {
				if(this.mouseMode === MOUSE_UP) {
					if(evt.shiftKey) {
						if(component.selected) {
							this.deselectComponent(component);
							// TODO: dont't drag anything
						} else {
							this.selectComponent(component);
						}
					} else {
						if(component.selected) {

						} else {
							this.deselectAll();
							this.selectComponent(component);
						}
					}

					this.startDragging(evt.clientX, evt.clientY);
				}
			}
		}
	};

	Editor.prototype.insertComponent = function(component, x, y) {
		this.components.push(component);
		component.x = x;
		component.y = y;
	};

	Editor.prototype.displayComponent = function (component) {
		var self = this;
		component.mousedownCallback = function (evt) {
			self.onComponentMousedown(component, evt);
		};

		component.display(this.$componentsGroup);
	};

	Editor.prototype.addComponent = function (component, x, y) {
		this.insertComponent(component, x, y);
		this.displayComponent(component);
	};

	Editor.prototype.createConnection = function (x1, y1, x2, y2) {
		var connection = new Connection(x1, y1, x2, y2);
		this.connections.push(connection);
		return connection;
	};

	Editor.prototype.displayConnection = function (connection) {
		connection.display(this.$connectionsGroup);
	};

	Editor.prototype.addConnection = function (x1, y1, x2, y2) {
		var connection = this.createConnection(x1, y1, x2, y2);
		this.displayConnection(connection);
	};

	Editor.prototype.addJoint = function (x, y) {
		var joint = new Joint(x, y);

		this.joints.push(joint);
		this.jointsByCoord[x + '|' + y] = joint;

		joint.display(this.$jointsGroup);
	};

	Editor.prototype.initSimulator = function () {
		var dateObj = window.performance || Date;
		var startTime = dateObj.now();

		for (var name in this.circuits) {
			if (this.circuits.hasOwnProperty(name)) {
				this.circuits[name].prepareSimulationCircuitConstruction();
			}
		}

		var simulationCircuit = this.circuits['main'].getSimulationCircuit(this.circuits);

		var endTime = dateObj.now();
		var time = endTime - startTime;
		console.log('Constructed circuit in ' + time + 'ms');

		this.simulator.init(simulationCircuit);
	};

	Editor.prototype.initSimulationDisplay = function () {
		var simComponents = this.simulator.circuit.components;
		for (var i = 0; i < simComponents.length; i++) {
			var simComponent = simComponents[i];

			var component = simComponent.editorComponent;
			if (component.initSimulationDisplay) {
				component.initSimulationDisplay(simComponent);
			}
		}
	};

	Editor.prototype.updateSimulationDisplay = function () {
		var simConnections = this.simulator.circuit.connections;
		for (var i = 0; i < simConnections.length; i++) {
			var simConnection = simConnections[i];

			var connections = simConnection.editorConnections;
			for (var j = 0; j < connections.length; j++) {
				var connection = connections[j];
				connection.setState(simConnection.value ? Connection.ACTIVE : Connection.DEFAULT);
			}
		}

		var simComponents = this.simulator.circuit.components;
		for (var i = 0; i < simComponents.length; i++) {
			var simComponent = simComponents[i];

			var component = simComponent.editorComponent;
			if (component.updateSimulationDisplay) {
				component.updateSimulationDisplay(simComponent);
			}
		}
	};

	Editor.prototype.resetSimulationDisplay = function () {
		var simConnections = this.simulator.circuit.connections;
		for (var i = 0; i < simConnections.length; i++) {
			var simConnection = simConnections[i];

			var connections = simConnection.editorConnections;
			for (var j = 0; j < connections.length; j++) {
				var connection = connections[j];
				connection.setState(Connection.DEFAULT);
			}
		}

		var simComponents = this.simulator.circuit.components;
		for (var i = 0; i < simComponents.length; i++) {
			var simComponent = simComponents[i];

			var component = simComponent.editorComponent;
			if (component.resetSimulationDisplay) {
				component.resetSimulationDisplay(simComponent);
			}
		}
	};

	Editor.prototype.startSimulationInterval = function () {
		var self = this;
		function update() {
			self.simulationAnimationFrame = requestAnimationFrame(update);

			self.simulator.step();
		}

		this.simulationAnimationFrame = requestAnimationFrame(update);
	};

	Editor.prototype.stopSimulationInterval = function () {
		cancelAnimationFrame(this.simulationAnimationFrame);
	};

	Editor.prototype.startSimulation = function () {
		this.initSimulator();

		this.initSimulationDisplay();
		this.updateSimulationDisplay();

		this.startSimulationInterval();
	};

	Editor.prototype.stopSimulation = function () {
		this.stopSimulationInterval();

		this.resetSimulationDisplay();

		this.simulator.reset();
	};

	Editor.prototype.stepSimulation = function () {
		this.simulator.step();
	};

	Editor.prototype.resumeSimulation = function () {
		this.startSimulationInterval();
	};

	Editor.prototype.pauseSimulation = function () {
		this.stopSimulationInterval();
	};

	return Editor;
});
