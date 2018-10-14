/**
 * Copyright: (c) 2016-2018 Max Klein
 * License: MIT
 */

const gulp = require('gulp');
const watch = require('gulp-watch');
const del = require('del');
const amdOptimize = require('gulp-amd-optimizer');
const amdclean = require('gulp-amdclean');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const wrap = require('gulp-wrap');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const filelist = require('gulp-filelist');
const mergeStream = require('merge-stream');

const srcDir = 'src/';
const destDir = 'build/';
const dirs = {
	js: 'js/',
	js_shared: 'js/shared/',
	js_main: 'js/main/',
	js_worker: 'js/worker/',
	sass: 'css/',
	html: '',
	fonts: 'fonts/',
	examples: 'examples/'
};
const paths = {
	js_shared: srcDir + dirs.js_shared + '**/*.js',
	js_main: srcDir + dirs.js_main + '**/*.js',
	js_main_components: srcDir + dirs.js_main + 'editor/components/**/*.js',
	js_worker: srcDir + dirs.js_worker + '**/*.js',
	js_worker_components: srcDir + dirs.js_worker + 'sim/components/**/*.js',
	sass: srcDir + dirs.sass + '**/*.{sass,scss}',
	html: srcDir + dirs.html + '**/*.html',
	fonts: srcDir + dirs.fonts + '**/*.{woff,woff2}',
	examples: srcDir + dirs.examples + '**/*.json'
};

gulp.task('clean', function () {
	return del([ destDir ]);
});

function processAmdModules(stream, dir, destFileName, wrapIIFE) {
	var concatenated = stream
		.pipe(sourcemaps.init())
		.pipe(amdOptimize({
			baseUrl: srcDir + dir
		}))
		.pipe(concat(destFileName))
		.pipe(amdclean.gulp({
			//
		}));

	var maybeWrapped;
	if (wrapIIFE) {
		maybeWrapped = concatenated.pipe(wrap('(function () {\n<%= contents %>\n})();\n'));
	} else {
		maybeWrapped = concatenated;
	}

	return maybeWrapped
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(destDir + dir));
}

gulp.task('js_main', function () {
	const merged = mergeStream(
		gulp.src(paths.js_main, { base: srcDir + dirs.js_main }),
		gulp.src(paths.js_main_components, { base: srcDir + dirs.js_main })
			.pipe(filelist('generated/editorComponents.js', {
				removeExtensions: true,
				relative: true
			}))
			.pipe(wrap(function (data) {
				var contents = data.contents.toString();
				var filenames = JSON.parse(contents);
				var argNames = filenames.map(function (filename, index) {
					return 'arg' + index;
				});
				return 'define(' + contents + ', function (' + argNames + ') {\n\treturn [' + argNames + '];\n});\n';
			}))
	);
	return processAmdModules(merged, dirs.js_main, 'main.min.js', true);
});

gulp.task('js_worker', function () {
	const merged = mergeStream(
		gulp.src(paths.js_worker, { base: srcDir + dirs.js_worker }),
		gulp.src(paths.js_worker_components, { base: srcDir + dirs.js_worker })
			.pipe(filelist('generated/components.js', {
				removeExtensions: true,
				relative: true
			}))
			.pipe(wrap(function (data) {
				var contents = data.contents.toString();
				var filenames = JSON.parse(contents);
				var argNames = filenames.map(function (filename, index) {
					return 'arg' + index;
				});
				return 'define(' + contents + ', function (' + argNames + ') {\n\treturn [' + argNames + '];\n});\n';
			}))
	);
	return processAmdModules(merged, dirs.js_worker, 'worker.min.js', true);
});

gulp.task('js', gulp.parallel('js_main', 'js_worker'));

gulp.task('html', function () {
	return gulp.src(paths.html, { base: srcDir + dirs.html })
		.pipe(gulp.dest(destDir + dirs.html));
});

gulp.task('sass', function () {
	return gulp.src(paths.sass, { base: srcDir + dirs.sass })
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(destDir + dirs.sass));
});

gulp.task('fonts', function () {
	return gulp.src(paths.fonts, { base: srcDir + dirs.fonts })
		.pipe(gulp.dest(destDir + dirs.fonts));
});

gulp.task('examples', function () {
	return gulp.src(paths.examples, { base: srcDir + dirs.examples })
		.pipe(gulp.dest(destDir + dirs.examples));
});

gulp.task('build', gulp.series('clean', gulp.parallel('js', 'html', 'sass', 'fonts', 'examples')));

gulp.task('watch', gulp.series('build', function () {
	gulp.watch(srcDir + '**/*', gulp.series('build'));
}));

gulp.task('default', gulp.series('build'));
