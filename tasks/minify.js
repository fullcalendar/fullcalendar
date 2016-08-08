var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');

// only for dist
// does not do gcal.js or lang-all.js or fullcalendar.print.css

gulp.task('minify', [ 'minify:js', 'minify:css' ]);

gulp.task('minify:clean', [ 'minify:js:clean', 'minify:css:clean' ]);

gulp.task('minify:js', [ 'minify:js:clean', 'modules' ], function() {
	return gulp.src([
			'dist/fullcalendar*.js',
			'!**/*.min.js'
		])
		.pipe(uglify({
			preserveComments: 'some' // keep comments starting with !
		}))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest('dist/'));
});

gulp.task('minify:js:clean', function() {
	return del('dist/*.min.js');
});

gulp.task('minify:css', [ 'minify:css:clean', 'modules' ], function() {
	return gulp.src([
			'dist/fullcalendar*.css',
			'!**/*.print.css',
			'!**/*.min.css'
		])
		.pipe(cssmin())
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('dist/'));
});

gulp.task('minify:css:clean', function() {
	return del('dist/*.min.css');
});
