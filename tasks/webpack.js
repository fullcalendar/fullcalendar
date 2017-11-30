const gulp = require('gulp')
const webpack = require('webpack-stream')
const gulpIgnore = require('gulp-ignore')
const modify = require('gulp-modify')
const webpackConfig = require('../webpack.config')


gulp.task('webpack', function() {
	return createStream()
})

gulp.task('webpack:dev', function() {
	return createStream(true)
})

gulp.task('webpack:watch', function() {
	return createStream(true, true)
})


function createStream(enableSourceMaps, enableWatch) {
	return gulp.src([]) // don't pass in any files. webpack handles that
		.pipe(
			webpack(Object.assign({}, webpackConfig, {
				devtool: enableSourceMaps ? 'source-map' : false, // also 'inline-source-map'
				watch: enableWatch || false,
			}))
		)
		.pipe(
			// don't write bogus .css.js(.map) files webpack created for standlone css outputs
			gulpIgnore.exclude('*.css.js*')
		)
		.pipe(
			// for modules that plug into the core, webpack produces files that overwrite
			// the `FullCalendar` browser global each time. strip it out.
			modify({
				fileModifier: function(file, content) {
					if (file.relative !== 'fullcalendar.js') {
						content = content.replace(
							/(root|exports)\[['"]FullCalendar['"]\]\s*=\s*/g,
							function(m) {
								// replace with spaces of same length, to keep integrity of sourcemaps
								return new Array(m.length + 1).join(' ')
							}
						)
					}
					return content
				}
			})
		)
		.pipe(
			gulp.dest(webpackConfig.output.path)
		)
}
