/**
 * Copyright: (c) 2017 Max Klein
 * License: MIT
 */

define(function () {
	function ComponentProperty(key, name, type, value, onchange) {
		this.key = key;
		this.name = name;
		this.type = type;
		this.value = value;
		this.onchange = onchange;
	}

	ComponentProperty.prototype.createHtml = function () {
		var $label = document.createElement('label');
		$label.className = 'property ' + this.type;
		$label.innerHTML = this.name + ': ';

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
				$label.appendChild($cb);
				break;
			case 'int':
				var $num = document.createElement('input');
				$num.type = 'number';
				$num.value = this.value;
				$num.addEventListener('input', function () {
					self.value = parseInt($num.value, 10);
					if(self.onchange) self.onchange();
				});
				$label.appendChild($num);
				break;
			case 'string':
				var $str = document.createElement('input');
				$str.type = 'text';
				$str.value = this.value;
				$str.addEventListener('input', function () {
					self.value = $str.value;
					if(self.onchange) self.onchange();
				});
				$label.appendChild($str);
				break;
		}

		return $label;
	};

	function ComponentProperties(def) {
		var props = [];
		var propsMap = {};
		for(var i = 0; i < def.length; i++) {
			var propDef = def[i];
			var key = propDef[0];
			var prop = new ComponentProperty(key, propDef[1], propDef[2], propDef[3], propDef[4]);
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

		return this._propsMap[key].value;
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
