var gulp = require('gulp');
var del = require('del');

require('./tasks/core');
require('./tasks/plugins');
require('./tasks/ts-types');
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
	'plugins:dev',
	'locale',
	'ts-types'
]);

// watch anything that needs to be built
gulp.task('watch', [
	'core:watch',
	'plugins:watch',
	'locale:watch',
	'ts-types:watch'
]);

// generates all files that end up in package manager release
gulp.task('dist', [
	'core',
	'plugins',
	'locale',
	'minify',
	'ts-types'
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
