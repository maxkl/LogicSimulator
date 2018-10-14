/**
 * Copyright: (c) 2018 Max Klein
 * License: MIT
 */

define(function () {
    var ComponentRegistry = {};

    var components = {};

    ComponentRegistry.register = function (name, constructor) {
        components[name] = constructor;
    };

    ComponentRegistry.getConstructor = function (name) {
        if (components.hasOwnProperty(name)) {
            return components[name];
        } else {
            return null;
        }
    };

    return ComponentRegistry;
});
