const gulp = require('gulp')

require('./tasks/build')
require('./tasks/dts')
require('./tasks/package-meta')
require('./tasks/lint')
require('./tasks/archive') // depends on the dist task

gulp.task('dist', [
  'build',
  'dts',
  'package-meta',
  'lint'
])

// require('./tasks/bump')
// require('./tasks/example-repos')
// // group these somewhat unrelated tasks together for CI
// gulp.task('lint-and-example-repos', [ 'lint', 'example-repos:build' ])
