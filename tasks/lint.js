var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');

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
	'jshint:built',
	'jscs:strict',
	'jscs:relaxed'
]);

// for non-browser JS
gulp.task('jshint:base', function() {
	return gulp.src([
			'*.js', // like gulpfile and root configs
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
			'!src/intro.js', // exclude
			'!src/outro.js', // "
			'locale/*.js',
		])
		.pipe(jshint(jshintBrowser))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

// for browser JS, after concat
gulp.task('jshint:built', [ 'modules', 'locale:all' ], function() {
	return gulp.src([
			'dist/*.js',
			'!dist/*.min.js', // exclude
			'!dist/locale-all.js' // "
		])
		.pipe(jshint(jshintBuilt))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
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
			'!src/intro.js', // exclude
			'!src/outro.js', // "
			'locale/*.js'
		])
		.pipe(jscs({
			configPath: '.jscs.js' // needs to be an external config
		}))
		.pipe(jscs.reporter())
		.pipe(jscs.reporter('fail'));
});
