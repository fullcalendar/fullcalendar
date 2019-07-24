const { src, dest } = require('gulp')
const terser = require('gulp-terser')
const cssmin = require('gulp-cssmin')
const rename = require('gulp-rename')


exports.minifyJs = minifyJs
exports.minifyCss = minifyCss


function minifyJs() {
  return src([
    'packages?(-premium)/*/dist/*.js',
    '!**/*.esm.js', // don't minify our generated ECMAScript modules
    '!**/*.min.js' // avoid double minify
  ], { base: '.' })
    .pipe(
      terser({
        output: {
          // preserve FC's leading comment but strip Microsoft tslib's
          // comment that starts with a row of ***
          comments: /^!(?! \*)/
        }
      })
    )
    .pipe(
      rename({ extname: '.min.js' })
    )
    .pipe(dest('.'))
}


function minifyCss() {
  return src([
    'packages?(-premium)/*/dist/*.css',
    '!**/*.min.css' // avoid double minify
  ], { base: '.' })
    .pipe(
      cssmin()
    )
    .pipe(
      rename({ extname: '.min.css' })
    )
    .pipe(dest('.'))
}
