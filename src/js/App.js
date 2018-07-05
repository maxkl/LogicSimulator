/**
 * Copyright: (c) 2016-2018 Max Klein
 * License: MIT
 */

define([
	'lib/SvgUtil',
	'editor/Editor'
], function (SvgUtil, Editor) {

    function getBaseUrl() {
        var fullPath = window.location.pathname;
        var lastSlashIndex = fullPath.lastIndexOf('/');

        var basePath = fullPath.substring(0, lastSlashIndex + 1);

        return window.location.origin + basePath;
    }

	function App() {
        this.baseUrl = getBaseUrl();
		this.editor = new Editor(this);
	}

	return App;
});
