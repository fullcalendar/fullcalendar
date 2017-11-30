const gulp = require('gulp');
const webpack = require('webpack-stream');
const gulpIgnore = require('gulp-ignore');
const createCoreConfig = require('./webpack/createCoreConfig');


gulp.task('core', function() {
	return createStream();
});

gulp.task('core:dev', function() {
	return createStream({ debug: true });
});

gulp.task('core:watch', function() {
	return createStream({ debug: true, watch: true });
});


function createStream(settings) {
	const config = createCoreConfig(settings);
	return gulp.src([]) // don't pass in any files. webpack handles that
		.pipe(webpack(config))
		.pipe(gulpIgnore.exclude('*.css.js*'))
			// ^ ignore the bogus .css.js(.map) files webpack creates for standlone css outputs
		.pipe(gulp.dest(config.output.path));
}
