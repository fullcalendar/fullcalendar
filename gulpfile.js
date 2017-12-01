var gulp = require('gulp');
var del = require('del');

require('./tasks/webpack');
require('./tasks/core-types');
require('./tasks/minify');
require('./tasks/archive');
require('./tasks/test');
require('./tasks/lint');
require('./tasks/bump');

// when running just `gulp`
gulp.task('default', [ 'dist' ]);

// everything needed for running demos and developing
gulp.task('dev', [
	'webpack:dev',
	'core-types'
]);

// watch anything that needs to be built
gulp.task('watch', [
	'webpack:watch',
	'core-types:watch'
]);

// generates all files that end up in package manager release
gulp.task('dist', [
	'webpack',
	'core-types',
	'minify'
]);

// like dist, but runs tests and linting, and generates archive
gulp.task('release', [
	'lint',
	'dist',
	'archive',
	'test:single' // headless, single run
]);

gulp.task('clean', function() {
	return del([ 'dist/', 'tmp/' ]);
});
