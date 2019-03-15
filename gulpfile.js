const gulp = require('gulp')

require('./tasks/build')
require('./tasks/minify')
require('./tasks/dts')
require('./tasks/package-meta')
require('./tasks/lint')
require('./tasks/archive')

gulp.task('dist', [
  'build',
  'minify',
  'dts',
  'package-meta'
])
