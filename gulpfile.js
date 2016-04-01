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
		"Viewport.js",
		"Renderer.js",
		"Editor.js",
		"App.js",
		"main.js"
	].map(function (s) {
		return srcDir + "/js/" + s;
	}),
	css: srcDir + "/css/**/*.css",
	html: srcDir + "/**/*.html"
};

gulp.task("clean", function () {
	return del([destDir]);
});
gulp.task("dev:clean", function () {
	return del([destDevDir]);
});

gulp.task("js", function () {
	return gulp.src(paths.js, { base: srcDir })
		.pipe(sourcemaps.init())
		.pipe(concat("main.js"))
		.pipe(wrap('(function(window, document) { "use strict"; <%=contents%> })(window, document);'))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(destDir + "/js"));
});
gulp.task("dev:js", function () {
	return gulp.src(paths.js, { base: srcDir })
		.pipe(sourcemaps.init())
		.pipe(concat("main.js"))
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(destDevDir + "/js"));
});

gulp.task("html", function () {
	return gulp.src(paths.html, { base: srcDir })
		.pipe(gulp.dest(destDir));
});
gulp.task("dev:html", function () {
	return gulp.src(paths.html, { base: srcDir })
		.pipe(gulp.dest(destDevDir));
});

gulp.task("css", function () {
	return gulp.src(paths.css)
		.pipe(autoprefixer())
		.pipe(cleanCSS())
		.pipe(gulp.dest(destDir + "/css"));
});
gulp.task("dev:css", function () {
	return gulp.src(paths.css)
		.pipe(autoprefixer())
		.pipe(gulp.dest(destDevDir + "/css"));
});

gulp.task("build", function (cb) {
	runSequence(
		"clean",
		["js", "html", "css"],
		cb
	);
});
gulp.task("dev:build", function (cb) {
	runSequence(
		"dev:clean",
		["dev:js", "dev:html", "dev:css"],
		cb
	);
});

gulp.task("watch", function () {
	watch(srcDir + "/**/*", function () {
		gulp.start("dev:build");
	})
});

gulp.task("default", ["build"]);
