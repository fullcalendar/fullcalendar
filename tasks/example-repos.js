const gulp = require('gulp')
const shell = require('gulp-shell')

gulp.task('example-repos:build', [ 'webpack', 'ts-types' ], shell.task(
  './bin/build-typescript-example.sh'
))
