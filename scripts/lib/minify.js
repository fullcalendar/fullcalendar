const { src, dest } = require('gulp')
const terser = require('gulp-terser')
const cssmin = require('gulp-cssmin')
const rename = require('gulp-rename')


exports.minifyBundleJs = minifyBundleJs
exports.minifyBundleCss = minifyBundleCss


function minifyBundleJs() {
  return src([
    'packages?(-premium)/bundle/*.js',
    'packages?(-premium)/*/*.global.js',
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


function minifyBundleCss() {
  return src([
    'packages?(-premium)/*/*.css',
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
