var del = require('del');
var gulp = require('gulp');

require('./tasks/modules');
require('./tasks/minify');
require('./tasks/archive');
require('./tasks/lang');
require('./tasks/test');
require('./tasks/lint');
require('./tasks/bump');

gulp.task('default', [ 'dist' ]);

gulp.task('clean', [
	'modules:clean',
	'lang:clean',
	'minify:clean',
	'archive:clean'
], function() {
	return del([ // from previous runs
		'dist/',
		'tmp/'
	]);
});

gulp.task('watch', [
	'modules:watch',
	'lang:watch'
]);

gulp.task('dist', [
	'modules',
	'lang',
	'minify',
	'archive'
]);

gulp.task('release', [
	'lint',
	'dist',
	'test:single'
]);
