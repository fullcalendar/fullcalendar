const gulp = require('gulp')
const shell = require('gulp-shell')

gulp.task('example-repos:test', [ 'webpack' ], shell.task(
  './bin/test-typescript-example.sh'
))
