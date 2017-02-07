/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

var gulp = require("gulp"),
	runSequence = require("run-sequence"),
	watch = require("gulp-watch");
var del = require("del"),
	uglify = require("gulp-uglify"),
	sourcemaps = require("gulp-sourcemaps"),
	concat = require("gulp-concat"),
	wrap = require("gulp-wrap"),
	autoprefixer = require("gulp-autoprefixer"),
	cleanCSS = require("gulp-clean-css");

var srcDir = "src",
	destDir = "build",
	destDevDir = "build-dev";
var paths = {
	js: [
		"lib/Logger.js",
		"lib/SvgUtil.js",
		"Viewport.js",
		"Renderer.js",
		"Editor.js",
		"Component.js",
		"App.js",
		"main.js"
	].map(function (s) {
		return srcDir + "/js/" + s;
	}),
	css: srcDir + "/css/**/*.css",
	html: srcDir + "/**/*.html",
	fonts: srcDir + "/fonts/**/*.{woff,woff2}"
};

function errorHandler() {
	console.log("Error (handler):", Array.prototype.slice.call(arguments));
}

gulp.task("clean", function () {
	return del([destDir]).catch(function (err) {
		console.error("Del error:", err);
	});
});
gulp.task("dev:clean", function () {
	return del([destDevDir]).catch(function (err) {
		console.error("Del error:", err);
	});
});

process.on("error", function (err) {
	console.error("Global error:", err);
});

gulp.task("js", function () {
	return gulp.src(paths.js, { base: srcDir })
		.pipe(sourcemaps.init())
		.pipe(concat("js/main.js"))
		.pipe(wrap('(function(window, document) { "use strict"; <%=contents%> })(window, document);'))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(destDir))
		.on("error", errorHandler);
});
gulp.task("dev:js", function () {
	return gulp.src(paths.js, { base: srcDir })
		.pipe(sourcemaps.init())
		.pipe(concat("js/main.js"))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(destDevDir))
		.on("error", errorHandler);
});

gulp.task("html", function () {
	return gulp.src(paths.html, { base: srcDir })
		.pipe(gulp.dest(destDir))
		.on("error", errorHandler);
});
gulp.task("dev:html", function () {
	return gulp.src(paths.html, { base: srcDir })
		.pipe(gulp.dest(destDevDir))
		.on("error", errorHandler);
});

gulp.task("css", function () {
	return gulp.src(paths.css, { base: srcDir })
		.pipe(autoprefixer())
		.pipe(cleanCSS())
		.pipe(gulp.dest(destDir))
		.on("error", errorHandler);
});
gulp.task("dev:css", function () {
	return gulp.src(paths.css, { base: srcDir })
		.pipe(autoprefixer())
		.pipe(gulp.dest(destDevDir))
		.on("error", errorHandler);
});

gulp.task("fonts", function () {
	return gulp.src(paths.fonts, { base: srcDir })
		.pipe(gulp.dest(destDir))
		.on("error", errorHandler);
});
gulp.task("dev:fonts", function () {
	return gulp.src(paths.fonts, { base: srcDir })
		.pipe(gulp.dest(destDevDir))
		.on("error", errorHandler);
});

gulp.task("build", function (cb) {
	runSequence(
		"clean",
		["js", "html", "css", "fonts"],
		cb
	);
});
gulp.task("dev:build", function (cb) {
	runSequence(
		"dev:clean",
		["dev:js", "dev:html", "dev:css", "dev:fonts"],
		cb
	);
});

gulp.task("watch", ["dev:build"], function () {
	watch(srcDir + "/**/*", function () {
		gulp.start("dev:build");
	})
});

gulp.task("default", ["build"]);
