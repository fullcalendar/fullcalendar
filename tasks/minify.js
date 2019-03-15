const gulp = require('gulp')
const uglify = require('gulp-uglify')
const cssmin = require('gulp-cssmin')
const rename = require('gulp-rename')

gulp.task('minify', [
  'minify:js',
  'minify:css'
])

gulp.task('minify:js', [ 'build' ], function() {
  return gulp.src([
    'dist/*/*.js',
    '!**/*.min.js' // avoid double minify
  ], { base: '.' })
    .pipe(
      uglify({
        preserveComments: 'some' // keep comments starting with !
      })
    )
    .pipe(
      rename({ extname: '.min.js' })
    )
    .pipe(gulp.dest('.'))
})

gulp.task('minify:css', [ 'build' ], function() {
  return gulp.src([
    'dist/*/*.css',
    '!**/*.min.css' // avoid double minify
  ], { base: '.' })
    .pipe(
      cssmin()
    )
    .pipe(
      rename({ extname: '.min.css' })
    )
    .pipe(
      gulp.dest('.')
    )
})
