/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define(function () {
	function ComponentProperty(key, name, type, value, onchange, opts) {
		this.key = key;
		this.name = name;
		this.type = type;
		this.value = value;
		this.onchange = onchange;
		this.opts = opts || {};

		this.$elem = null;
	}

	ComponentProperty.prototype.createHtml = function () {
		var createLabel = false;
		var $element = null;

		var self = this;
		switch(this.type) {
			case 'bool':
				var $cb = document.createElement('input');
				$cb.type = 'checkbox';
				$cb.checked = this.value;
				$cb.addEventListener('change', function () {
					self.value = $cb.checked;
					if(self.onchange) self.onchange();
				});
				$element = $cb;
				createLabel = true;
				break;
			case 'int':
				var $num = document.createElement('input');
				$num.type = 'number';
				$num.value = this.value;
				if(this.opts.hasOwnProperty('min')) $num.min = this.opts.min;
				if(this.opts.hasOwnProperty('max')) $num.max = this.opts.max;
				$num.addEventListener('input', function () {
					self.value = parseInt($num.value, 10);
					if(self.onchange) self.onchange();
				});
				$element = $num;
				createLabel = true;
				break;
			case 'string':
				var $str = document.createElement('input');
				$str.type = 'text';
				$str.value = this.value;
				$str.addEventListener('input', function () {
					self.value = $str.value;
					if(self.onchange) self.onchange();
				});
				$element = $str;
				createLabel = true;
				break;
			case 'button':
				var $btn = document.createElement('button');
				$btn.textContent = this.name;
				$btn.addEventListener('click', function () {
					if(self.onchange) self.onchange();
				});
				var $div = document.createElement('div');
				$div.appendChild($btn);
				$element = $div;
				break;
			case 'helptext':
				var $div = document.createElement('div');
				$div.textContent = this.value;
				$element = $div;
				this.$elem = $div;
				break;
		}

		if (createLabel) {
			var $label = document.createElement('label');
			$label.className = 'property ' + this.type;
			$label.innerHTML = this.name + ': ';
			$label.appendChild($element);
			$element = $label;
		}

		return $element;
	};

	ComponentProperty.prototype.updateHtml = function () {
		if (!this.$elem) {
			return;
		}

		switch (this.type) {
			case 'helptext':
				this.$elem.textContent = this.value;
				break;
		}
	};

	ComponentProperty.prototype.get = function () {
		return this.value;
	};

	ComponentProperty.prototype.set = function (value) {
		this.value = value;
		this.updateHtml();
	};

	function ComponentProperties(def) {
		var props = [];
		var propsMap = {};
		for(var i = 0; i < def.length; i++) {
			var propDef = def[i];
			var key = propDef[0];
			var prop = new (Function.prototype.bind.apply(ComponentProperty, [null].concat(propDef)));
			props.push(prop);
			propsMap[key] = prop;
		}
		this._propsMap = propsMap;
		this._props = props;
		this.length = this._props.length;
	}

	ComponentProperties.prototype.get = function (key) {
		if(!this._propsMap.hasOwnProperty(key)) {
			throw new Error('Unknown property ' + key);
		}

		return this._propsMap[key].get();
	};

	ComponentProperties.prototype.set = function (key, value) {
		if(!this._propsMap.hasOwnProperty(key)) {
			throw new Error('Unknown property ' + key);
		}

		this._propsMap[key].set(value);
	};

	ComponentProperties.prototype.display = function ($c) {
		$c.innerHTML = '';

		for(var i = 0; i < this._props.length; i++) {
			var prop = this._props[i];
			var $prop = prop.createHtml();
			$c.appendChild($prop);
		}
	};

	return ComponentProperties;
});
