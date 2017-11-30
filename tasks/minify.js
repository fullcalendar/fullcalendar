var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');


gulp.task('minify', [
	'minify:non-locale',
	'minify:locale',
	'minify:css'
]);


gulp.task('minify:non-locale', [ 'webpack' ], function() {
	return gulp.src([
		'dist/*.js',
		'!dist/locale-all.js' // another task handles locale
	])
		.pipe(uglify({
			preserveComments: 'some' // keep comments starting with !
		}))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest('dist/'));
});


gulp.task('minify:locale', [ 'webpack' ], function() {
	return gulp.src([
		'dist/locale-all.js',
		'dist/locale/*.js'
	], { base: 'dist/' })
		.pipe(uglify())
		.pipe(gulp.dest('dist/')); // overwrite original files
});


gulp.task('minify:css', [ 'webpack' ], function() {
	return gulp.src([
		'dist/*.css',
		'!dist/*.min.css' // avoid double minify
	])
		.pipe(cssmin())
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('dist/'));
});
