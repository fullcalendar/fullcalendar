const gulp = require('gulp')
const gutil = require('gulp-util')
const filter = require('gulp-filter')
const modify = require('gulp-modify-file')
const uglify = require('gulp-uglify')
const webpack = require('webpack-stream')
const packageConfig = require('../package.json')
const webpackConfig = require('../webpack.config')


gulp.task('webpack', function() {
  return createStream()
})

gulp.task('webpack:dev', function() {
  return createStream(true)
})

gulp.task('webpack:watch', function() {
  createStream(true, true)
})


const jsFilter = filter([ '**/*.js' ], { restore: true })
const localeFilter = filter([ '**/locale-all.js', '**/locale/*.js' ], { restore: true })

function createStream(isDev, isWatch) {
  let stream = gulp.src([]) // don't pass in any files. webpack handles that
    .pipe(
      webpack(
        Object.assign({}, webpackConfig, {
          devtool: isDev ? 'source-map' : false, // also 'inline-source-map'
          watch: isWatch || false
        }),
        null,
        reporterFunc
      )
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
      if (file.relative !== 'dist/fullcalendar.js') {
        content = content.replace(/(root|exports)\[['"]FullCalendar['"]\]\s*=\s*/g, '')
      }

      // strip out "use strict", which moment and webpack harmony generates.
      content = content.replace(/['"]use strict['"]/g, '')

      return content
    }))
    .pipe(jsFilter.restore)

  if (!isDev) {
    stream = stream
      .pipe(localeFilter)
      .pipe(uglify()) // uglify only the locale files, then bring back other files to stream
      .pipe(localeFilter.restore)
  }

  return stream.pipe(
    gulp.dest(webpackConfig.output.path)
  )
}

/*
Purpose is to filter out the poorly formatted stats for locale files
*/
function reporterFunc(err, stats) {
  if (err) {
    gutil.log('Problem compiling!')
  } else {
    let assets = stats.compilation.assets
    let filteredAssets = {}
    let localeModuleCnt = 0

    for (let moduleName in assets) {
      if (moduleName.match(/^dist\/locale/)) {
        localeModuleCnt++
      } else {
        filteredAssets[moduleName] = assets[moduleName]
      }
    }

    stats.compilation.assets = filteredAssets
    gutil.log(
      stats.toString({
        // from https://github.com/shama/webpack-stream/blob/v4.0.0/index.js#L12
        colors: true,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false,
        modules: false,
        children: true,
        version: true,
        cached: false,
        cachedAssets: false,
        reasons: false,
        source: false,
        errorDetails: false
      })
    )

    if (localeModuleCnt) {
      gutil.log(`Also compiled ${localeModuleCnt} locale-related files.`)
    }
  }
}
