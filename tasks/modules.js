var del = require('del');
var _ = require('lodash');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var template = require('gulp-template');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var webpack = require('webpack-stream'); // for fullcalendar.js, use webpack

// project configs
var packageConf = require('../package.json');
var srcConf = require('../src.json');
var webpackConf = require('../webpack.config.js');

// generates js/css files in dist directory
gulp.task('modules', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:' + distFile; // generates an array of task names
}), function() {
	return gulp.src(webpackConf.entry)
		.pipe(
			webpack(webpackConf)
		)
		.pipe(
			gulp.dest(webpackConf.output.path)
		);
});

// generates js/css/sourcemap files in dist directory
gulp.task('modules:dev', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:dev:' + distFile; // generates an array of task names
}), function() {
	return gulp.src(webpackConf.entry)
		.pipe(
			webpack(Object.assign({}, webpackConf, {
				devtool: 'source-map' // also 'inline-source-map'
			})
		))
		.pipe(
			gulp.dest(webpackConf.output.path)
		);
});

// watches source files and generates js/css/sourcemaps
gulp.task('modules:watch', _.map(srcConf, function(srcFiles, distFile) {
	return 'modules:watch:' + distFile; // generates an array of task names
}), function() {
	return gulp.src(webpackConf.entry)
		.pipe(
			webpack(Object.assign({}, webpackConf, {
				devtool: 'source-map', // also 'inline-source-map'
				watch: true
			})
		))
		.pipe(
			gulp.dest(webpackConf.output.path)
		);
});

// deletes all generated js/css files in the dist directory
gulp.task('modules:clean', function() {
	return del('dist/*.{js,css,map}');
});

// loop the distFile:srcFiles map
_.forEach(srcConf, function(srcFiles, distFile) {
	var isJs = /\.js$/.test(distFile);
	var separator = isJs ? '\n;;\n' : '\n\n'; // inserted between concated files

	gulp.task('modules:' + distFile, function() {
		return gulp.src(srcFiles, { cwd: 'src/', base: 'src/' })
			.pipe(plumber()) // affects future streams
			.pipe(concat(distFile, { newLine: separator }))
			.pipe(template(packageConf)) // replaces <%= %> variables
			.pipe(gulp.dest('dist/'));
	});

	gulp.task('modules:dev:' + distFile, function() {
		return gulp.src(srcFiles, { cwd: 'src/', base: 'src/' })
			.pipe(plumber()) // affects future streams
			.pipe(sourcemaps.init())
			.pipe(concat(distFile, { newLine: separator }))
			.pipe(template(packageConf)) // replaces <%= %> variables
			.pipe(sourcemaps.write('.', {
				includeContent: false, // because we'll reference the src files
				sourceRoot: '../src/' // relative to outputted file in dist
			}))
			.pipe(gulp.dest('dist/'));
	});

	// generates dev files first, then watches
	gulp.task('modules:watch:' + distFile, [ 'modules:dev:' + distFile ], function() {
		return gulp.watch(srcFiles, { cwd: 'src/' }, [ 'modules:dev:' + distFile ]);
	});
});
