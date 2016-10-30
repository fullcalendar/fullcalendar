var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var del = require('del');

gulp.task('minify', [
	'minify:js',
	'minify:css'
]);

gulp.task('minify:clean', function() {
	return del('dist/*.min.{js,css}');
});

// minifies the core modules's js
gulp.task('minify:js', [ 'modules' ], function() {
	return gulp.src([
		'dist/*.js',
		'!dist/*.min.js', // avoid double minify
		'!dist/locale-all.js' // already minified
	])
	.pipe(uglify({
		preserveComments: 'some' // keep comments starting with !
	}))
	.pipe(rename({ extname: '.min.js' }))
	.pipe(gulp.dest('dist/'));
});

// minifies the core modules's css
gulp.task('minify:css', [ 'modules' ], function() {
	return gulp.src([
		'dist/*.css',
		'!dist/*.min.css' // avoid double minify
	])
	.pipe(cssmin())
	.pipe(rename({ extname: '.min.css' }))
	.pipe(gulp.dest('dist/'));
});
