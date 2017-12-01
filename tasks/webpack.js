const gulp = require('gulp')
const webpack = require('webpack-stream')
const filter = require('gulp-filter')
const modify = require('gulp-modify-file')
const uglify = require('gulp-uglify')
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


const localeFilter = filter([ '**/locale-all.js', '**/locale/*.js' ], { restore: true })

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
			filter([ '**', '!**/*.css.js*' ])
		)
		.pipe(
			modify(function(content, path, file) {

				// for modules that plug into the core, webpack produces files that overwrite
				// the `FullCalendar` browser global each time. strip it out.
				if (file.relative !== 'fullcalendar.js') {
					content = content.replace(
						/(root|exports)\[['"]FullCalendar['"]\]\s*=\s*/g,
						function(m) {
							// replace with spaces of same length to maintain sourcemap integrity
							return new Array(m.length + 1).join(' ')
						}
					)
				}

				// strip out "use strict", which moment and webpack harmony generates.
				// replace with spaces of same length to maintain sourcemap integrity.
				content = content.replace(/['"]use strict['"]/g, '            ');

				return content
			})
		)
		.pipe(localeFilter)
		.pipe(uglify()) // uglify only the locale files, then bring back other files to stream
		.pipe(localeFilter.restore)
		.pipe(
			gulp.dest(webpackConfig.output.path)
		)
}
