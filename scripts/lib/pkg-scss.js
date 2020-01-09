const { src, dest } = require('gulp')
const rename = require('gulp-rename')
const { watch } = require('./util')


const GLOB = 'packages?(-premium)/*/src/**/*.scss'


exports.copyScss = copyScss
exports.watchScss = watchScss


function copyScss() {
  return src(GLOB)
    .pipe(
      rename(function(pathParts) {
        pathParts.dirname = pathParts.dirname.replace(/\/src(\/|$)/, '/dist$1')
      })
    )
    .pipe(dest('.'))
}


function watchScss() {
  return watch(GLOB, copyScss)
}
