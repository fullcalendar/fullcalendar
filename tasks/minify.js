var gulp = require('gulp')
var uglify = require('gulp-uglify')
var cssmin = require('gulp-cssmin')
var rename = require('gulp-rename')


gulp.task('minify', [
  'minify:js',
  'minify:css'
])


gulp.task('minify:js', [ 'webpack' ], function() {
  return gulp.src([
    'dist/*.js',
    '!dist/locales-all.js', // already minified by webpack task
    'dist/plugins/*.js',
    '!dist/**/*.min.js' // avoid double minify
  ], { base: 'dist/' })
    .pipe(uglify({
      preserveComments: 'some' // keep comments starting with !
    }))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('dist/'))
})


gulp.task('minify:css', [ 'webpack' ], function() {
  return gulp.src([
    'dist/*.css',
    'dist/plugins/*.css',
    '!dist/**/*.min.css' // avoid double minify
  ])
    .pipe(cssmin())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('dist/'))
})
