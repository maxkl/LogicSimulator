/**
 * Copyright: (c) 2019 Max Klein
 * License: MIT
 */

define([
	'editor/Component',
	'editor/ComponentProperties',
	'editor/displayComponent',
	'shared/lib/extend'
], function (Component, ComponentProperties, displayComponent, extend) {
	var COMPONENT_LABEL = 'ROM';
	var COMPONENT_WIDTH = 11;

	function arrayBufferToBase64(arrayBuffer) {
		var binary = '';
		var bytes = new Uint8Array(arrayBuffer);
		for (var i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	}

	function base64ToArrayBuffer(base64) {
		var binary = window.atob(base64);
		var bytes = new Uint8Array(binary.length);
		for (var i = 0; i < bytes.byteLength; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes.buffer;
	}

	function ROMComponent() {
		Component.call(this);

		this.pins = null;

		this.width = 0;
		this.height = 0;
		this.pins = null;

		this.$container = null;
		this.$rect = null;

		var self = this;
		function updateLayout() {
			self.layout();
			self._updateDisplay();
		}

		this.properties = new ComponentProperties([
			[ 'addresswidth', 'Address width', 'int', 4, updateLayout, { min: 1 } ],
			[ 'wordsize', 'Word size', 'enum', 8, updateLayout, { values: [8, 16, 32] } ],
			[ 'contents', 'Contents', 'file', new ArrayBuffer() ]
		]);

		this.layout();
	}

	extend(ROMComponent, Component);

	ROMComponent.prototype._save = function (data) {
		data.addresswidth = this.properties.get('addresswidth');
		data.wordsize = this.properties.get('wordsize');
		data.contents = arrayBufferToBase64(this.properties.get('contents'));
	};

	ROMComponent.prototype._load = function (data) {
		this.properties.set('addresswidth', data.addresswidth);
		this.properties.set('wordsize', data.wordsize);
		this.properties.set('contents', base64ToArrayBuffer(data.contents));

		this.layout();
	};

	ROMComponent.prototype.layout = function () {
		var addresswidth = Math.max(1, this.properties.get('addresswidth'));
		var wordsize = this.properties.get('wordsize');

		var inputs = ['OE', null];
		for (var i = 0; i < addresswidth; i++) {
			inputs.push('A' + i);
		}

		var outputs = [];
		for (var i = 0; i < wordsize; i++) {
			outputs.push('Q' + i);
		}

		var layout = displayComponent.layout(inputs, outputs, COMPONENT_WIDTH);
		this.width = layout.width;
		this.height = layout.height;
		this.pins = layout.pins;
	};

	ROMComponent.prototype._display = function ($c) {
		this.$container = $c;
		this._updateDisplay();
	};

	ROMComponent.prototype._updateDisplay = function () {
		this.$container.innerHTML = '';
		this.$rect = displayComponent(this.$container, this.width, this.height, this.pins, COMPONENT_LABEL);
		this.$rect.addEventListener('mousedown', this.mousedownCallback);

		if(this.selected) {
			this._select();
		}
	};

	ROMComponent.prototype._select = function () {
		this.$rect.setAttribute('stroke', '#0288d1');
	};

	ROMComponent.prototype._deselect = function () {
		this.$rect.setAttribute('stroke', '#000');
	};

	ROMComponent.prototype._serializeForSimulation = function () {
		return {
			name: 'ROM',
			args: [
				this.properties.get('addresswidth'),
				this.properties.get('wordsize'),
				this.properties.get('contents')
			]
		};
	};

	ROMComponent.typeName = 'ROM';
	ROMComponent.sidebarEntry = {
		name: 'ROM',
		category: 'Memory',
		drawPreview: function (svg) {
			var layout = displayComponent.layout(
				['OE', null, 'A0', 'A1', 'A2', 'A3'],
				['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'],
				COMPONENT_WIDTH
			);
			displayComponent(svg, layout.width, layout.height, layout.pins, COMPONENT_LABEL);
		}
	};

	return ROMComponent;
});
