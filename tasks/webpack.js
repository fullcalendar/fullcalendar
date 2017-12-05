const gulp = require('gulp')
const webpack = require('webpack-stream')
const filter = require('gulp-filter')
const modify = require('gulp-modify-file')
const uglify = require('gulp-uglify')
const packageConfig = require('../package.json')
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


const jsFilter = filter([ '**/*.js' ], { restore: true })
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
			// don't write bogus .css.js(.map) files webpack created for standalone css outputs
			filter([ '**', '!**/*.css.js*' ])
		)
		.pipe(
			// populate <%= %> variables in source code
			modify(function(content) {
				return content.replace(
					/<%=\s*(\w+)\s*%>/g,
					function(match, p1) {
						return packageConfig[p1]
					}
				)
			})
		)
		.pipe(jsFilter)
		.pipe(modify(function(content, path, file) {

			// for modules that plug into the core, webpack produces files that overwrite
			// the `FullCalendar` browser global each time. strip it out.
			if (file.relative !== 'fullcalendar.js') {
				content = content.replace(/(root|exports)\[['"]FullCalendar['"]\]\s*=\s*/g, '')
			}

			// strip out "use strict", which moment and webpack harmony generates.
			content = content.replace(/['"]use strict['"]/g, '');

			return content
		}))
		.pipe(jsFilter.restore)
		.pipe(localeFilter)
		.pipe(uglify()) // uglify only the locale files, then bring back other files to stream
		.pipe(localeFilter.restore)
		.pipe(gulp.dest(webpackConfig.output.path))
}
