/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define(function () {
	function Component(args) {
        this.args = args || [];
		this.editorComponent = null;
	}

    Component.prototype.clone = function () {
        var newComponent = new this.constructor(this.args);
        newComponent.editorComponent = this.editorComponent;
        return newComponent;
    };

	return Component;
});
