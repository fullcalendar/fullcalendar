var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var tslint = require("gulp-tslint");
var tsLintLib = require("tslint");

var webpackConfig = require('../webpack.config');
var tslintProgram = tsLintLib.Linter.createProgram("./tsconfig.json");

// different types of jshint configs
var jshintConfig = require('../.jshint.js');
var jshintBase = jshintConfig.base;
var jshintBrowser = jshintConfig.browser;
var jshintBuilt = jshintConfig.built;

// don't let gulp-jshint search for .jshintrc files
jshintBase.lookup = false;
jshintBrowser.lookup = false;
jshintBuilt.lookup = false;

gulp.task('lint', [
	'jshint:base',
	'jshint:browser',
	'jscs:strict',
	'jscs:relaxed',
	'tslint'
]);

// for non-browser JS
gulp.task('jshint:base', function() {
	return gulp.src([
			'tasks/*.js',
			'tests/automated/*.js',
			'tests/automated-better/*.js'
		])
		.pipe(jshint(jshintBase))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

// for browser JS, before concat
gulp.task('jshint:browser', function() {
	return gulp.src([
			'src/**/*.js',
			'!src/**/intro.js', // exclude
			'!src/**/outro.js', // "
			'!src/tslib-lite.js', // "
			'locale/*.js',
		])
		.pipe(jshint(jshintBrowser))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

// for typescript
gulp.task('tslint', function() {
	return gulp.src(webpackConfig.entry)
		.pipe(
			tslint({ // will use tslint.json
				formatter: 'verbose',
				program: tslintProgram // for type-checking rules
			})
		)
		.pipe(tslint.report());
});

// files we want to lint to a higher standard
gulp.task('jscs:strict', function() {
	return gulp.src([
			'tests/automated/*.js',
			'tests/automated-better/*.js'
		])
		.pipe(jscs({
			configPath: '.jscs.strict.js' // needs to be an external config
		}))
		.pipe(jscs.reporter())
		.pipe(jscs.reporter('fail'));
});

// more relaxed linting. eventually move these to strict
gulp.task('jscs:relaxed', function() {
	return gulp.src([
			'*.js', // like gulpfile and root configs
			'tasks/*.js',
			'src/**/*.js',
			'!src/**/intro.js', // exclude
			'!src/**/outro.js', // "
			'!src/tslib-lite.js', // "
			'locale/*.js'
		])
		.pipe(jscs({
			configPath: '.jscs.js' // needs to be an external config
		}))
		.pipe(jscs.reporter())
		.pipe(jscs.reporter('fail'));
});
