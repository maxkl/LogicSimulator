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
	sass: 'css/',
	html: '',
	fonts: 'fonts/',
	examples: 'examples/'
};
const paths = {
	js: srcDir + dirs.js + '**/*.js',
	js_components: srcDir + dirs.js + 'editor/components/**/*.js',
	sass: srcDir + dirs.sass + '**/*.{sass,scss}',
	html: srcDir + dirs.html + '**/*.html',
	fonts: srcDir + dirs.fonts + '**/*.{woff,woff2}',
	examples: srcDir + dirs.examples + '**/*.json'
};

gulp.task('clean', function () {
	return del([ destDir ]);
});

gulp.task('js', function () {
	const merged = mergeStream(
		gulp.src(paths.js, { base: srcDir + dirs.js }),
		gulp.src(paths.js_components, { base: srcDir + dirs.js })
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
	return merged
		.pipe(sourcemaps.init())
		.pipe(amdOptimize({
			baseUrl: srcDir + dirs.js
		}))
		.pipe(concat('main.js'))
		.pipe(amdclean.gulp({
			//
		}))
		.pipe(wrap('(function () {\n<%= contents %>\n})();\n'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(destDir + dirs.js));
});

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
