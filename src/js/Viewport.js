/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var Viewport = (function (window, document) {
	"use strict";

	function Viewport(app, $svg) {
		this.log = new Logger("Viewport");

		this.app = app;

		this.$svg = $svg;

		this.$viewportGroup = $svg.getElementById("editor-viewport");
		this.transform = this.$viewportGroup.transform.baseVal[0];
		this.transformMatrix = this.transform.matrix;

		this.$backgroundPattern = $svg.getElementById("background-pattern");
		this.bgTransform = this.$backgroundPattern.patternTransform.baseVal[0];
		this.bgTransformMatrix = this.bgTransform.matrix;

		this.x = 0;
		this.y = 0;
		this.scale = 1;

		this.log.debug("Constructed");
	}

	/**
	 * Convert a coordinate in screen space to world space
	 * @param {number} x
	 * @return {number}
	 */
	Viewport.prototype.viewportToWorldX = function (x) {
		return (-this.x + x) / this.scale;
	};

	/**
	 * Convert a coordinate in screen space to world space
	 * @param {number} y
	 * @return {number}
	 */
	Viewport.prototype.viewportToWorldY = function (y) {
		return (-this.y + y) / this.scale;
	};

	/**
	 * Set the viewport scale
	 * @param {number} scale
	 */
	Viewport.prototype.setScale = function (scale) {
		if(scale > 8) {
			scale = 8;
		}

		this.scale = scale;

		var matrix = this.transformMatrix;
		matrix.d = matrix.a = scale;

		var bgMatrix = this.bgTransformMatrix;
		bgMatrix.d = bgMatrix.a = scale;
	};

	/**
	 * Set the position (translation) of the viewport. Coordinates are in screen space
	 * @param {number} x
	 * @param {number} y
	 */
	Viewport.prototype.setPosition = function (x, y) {
		this.x = x;
		this.y = y;

		var matrix = this.transformMatrix;
		matrix.e = x;
		matrix.f = y;

		var bgMatrix = this.bgTransformMatrix;
		bgMatrix.e = x;
		bgMatrix.f = y;
	};

	/**
	 * Set the viewport position, so that the specified coordinate (world space) lies in the origin (0, 0) of the screen
	 * @param {number} x
	 * @param {number} y
	 */
	Viewport.prototype.setOrigin = function (x, y) {
		this.setPosition(-(x * this.scale), -(y * this.scale));
	};

	/**
	 * Move the viewport by a specified distance in world space.
	 * Positive values move the "camera" to the right [bottom], negative values move them to the left [top]
	 * @param {number} x
	 * @param {number} y
	 */
	Viewport.prototype.pan = function (x, y) {
		var originX = -this.x / this.scale,
			originY = -this.y / this.scale;

		this.setOrigin(originX + x, originY + y);
	};

	/**
	 * Zoom the viewport by a specified amount to a specified point.
	 * A zoom amount > 1 scales elements up, a zoom amount < 1 scales elements down
	 * @param amount
	 * @param x
	 * @param y
	 */
	Viewport.prototype.zoom = function (amount, x, y) {
		var newScale = this.scale * amount;

		var zoomPointX = this.viewportToWorldX(x),
			zoomPointY = this.viewportToWorldY(y);

		this.setScale(newScale);

		var newZoomPointX = this.viewportToWorldX(x),
			newZoomPointY = this.viewportToWorldY(y);
		var zoomPointDistanceX = zoomPointX - newZoomPointX,
			zoomPointDistanceY = zoomPointY - newZoomPointY;

		this.pan(zoomPointDistanceX, zoomPointDistanceY);
	};

	return Viewport;
})(window, document);
