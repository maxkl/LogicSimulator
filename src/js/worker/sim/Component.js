/**
 * Copyright: (c) 2017-2018 Max Klein
 * License: MIT
 */

define(function () {
	function Component(args) {
        this.args = args || [];
        this.needsReference = false;
        this.reference = null;
        this.editorComponent = null;
	}

    Component.prototype.clone = function () {
        var newComponent = new this.constructor(this.args);
        newComponent.needsReference = this.needsReference;
        newComponent.reference = this.reference;
        newComponent.editorComponent = this.editorComponent;
        return newComponent;
    };

	return Component;
});
