var gulp = require('gulp');
var del = require('del');

require('./tasks/core');
require('./tasks/core-types');
require('./tasks/plugins');
require('./tasks/minify');
require('./tasks/archive');
require('./tasks/locale');
require('./tasks/test');
require('./tasks/lint');
require('./tasks/bump');

// when running just `gulp`
gulp.task('default', [ 'dist' ]);

// everything needed for running demos and developing
gulp.task('dev', [
	'core:dev',
	'core:types',
	'plugins:dev',
	'locale'
]);

// watch anything that needs to be built
gulp.task('watch', [
	'core:watch',
	'core:types:watch',
	'plugins:watch',
	'locale:watch'
]);

// generates all files that end up in package manager release
gulp.task('dist', [
	'core',
	'core:types',
	'plugins',
	'locale',
	'minify'
]);

// like dist, but runs tests and linting, and generates archive
gulp.task('release', [
	'lint',
	'dist',
	'archive',
	'test:single' // headless, single run
]);

gulp.task('clean', [
	'locale:clean',
	'minify:clean',
	'archive:clean'
], function() {
	return del([ // kill these directories, and anything leftover in them
		'dist/',
		'tmp/'
	]);
});
