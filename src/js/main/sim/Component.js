/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define(function () {
	function Component() {
		this.editorComponent = null;
	}

    Component.prototype.clone = function () {
        var newComponent;
        if (this._clone) {
            newComponent = this._clone();
        } else {
            newComponent = new this.constructor();
        }

        newComponent.editorComponent = this.editorComponent;

        return newComponent;
    };

	return Component;
});
