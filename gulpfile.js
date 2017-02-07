/**
 * Copyright: (c) 2016 Max Klein
 * License: MIT
 */

const gulp = require('gulp');
const runSequence = require('run-sequence');
const watch = require('gulp-watch');
const del = require('del');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const wrap = require('gulp-wrap');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const srcDir = 'src/';
const destDir = 'build/';
const paths = {
	js: [
		'lib/Logger.js',
		'lib/SvgUtil.js',
		'Viewport.js',
		'Renderer.js',
		'Editor.js',
		'Component.js',
		'App.js',
		'main.js'
	].map(name => srcDir + 'js/' + name),
	sass: srcDir + 'css/**/*.{sass,scss}',
	html: srcDir + '**/*.html',
	fonts: srcDir + 'fonts/**/*.{woff,woff2}'
};

gulp.task('clean', function () {
	return del([ destDir ]);
});

gulp.task('js', function () {
	return gulp.src(paths.js, { base: srcDir })
		.pipe(sourcemaps.init())
		.pipe(concat('js/main.js'))
		.pipe(wrap('(function(window, document) { \'use strict\'; <%=contents%> })(window, document);'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(destDir));
});

gulp.task('html', function () {
	return gulp.src(paths.html, { base: srcDir })
		.pipe(gulp.dest(destDir));
});

gulp.task('sass', function () {
	return gulp.src(paths.sass, { base: srcDir })
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(destDir));
});

gulp.task('fonts', function () {
	return gulp.src(paths.fonts, { base: srcDir })
		.pipe(gulp.dest(destDir));
});

gulp.task('build', function (cb) {
	runSequence('clean', ['js', 'html', 'sass', 'fonts'], cb);
});

gulp.task('watch', [ 'build' ], function () {
	watch(srcDir + '/**/*', function () {
		gulp.start('build');
	});
});

gulp.task('default', [ 'build' ]);
