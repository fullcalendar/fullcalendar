const gulp = require('gulp')
const del = require('del')

require('./tasks/webpack')
require('./tasks/ts-types')
require('./tasks/minify')
require('./tasks/archive')
require('./tasks/test')
require('./tasks/lint')
require('./tasks/bump')
require('./tasks/example-repos')

// when running just `gulp`
gulp.task('default', [ 'dist' ])

// everything needed for running demos and developing
gulp.task('dev', [
  'webpack:dev',
  'ts-types'
])

// watch anything that needs to be built
gulp.task('watch', [
  'webpack:watch',
  'ts-types:watch'
])

// generates all files that end up in package manager release
gulp.task('dist', [
  'webpack',
  'ts-types',
  'minify'
])

// like dist, but runs tests and linting, and generates archive
gulp.task('release', [
  'example-repos:build',
  'lint',
  'dist',
  'archive',
  'test:single' // headless, single run
])

// group these somewhat unrelated tasks together for CI
gulp.task('lint-and-example-repos', [ 'lint', 'example-repos:build' ])

gulp.task('clean', function() {
  return del([ 'dist/', 'tmp/', '.awcache/' ])
})
