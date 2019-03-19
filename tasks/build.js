const path = require('path')
const gulp = require('gulp')
const shell = require('gulp-shell')
const modify = require('gulp-modify-file')
const fcBuildUtils = require('./util')
const rootPackageConfig = require('../package.json')

gulp.task('build', [ 'build:raw' ], function() {
  return gulp.src([
    'dist/*/*.{js,css}',
    '!**/*.min.js',
    '!**/*.min.css'
  ], { base: '.' })
    .pipe(
      modify(modifySource)
    )
    .pipe(
      gulp.dest('.')
    )
})

gulp.task('build:raw', shell.task(
  'npm run build'
))

const BANNER =
  '/*!\n' +
  '<%= title %> v<%= version %>\n' +
  'Docs & License: <%= homepage %>\n' +
  '(c) <%= copyright %>\n' +
  '*/\n'

function modifySource(content, filePath) {
  let packageName = path.basename(path.dirname(filePath))

  // TODO: unite this logic
  let specificPackageConfig = require(path.join('../src', packageName, 'package.json'))
  let vars = Object.assign({}, rootPackageConfig, specificPackageConfig, {
    name: '@fullcalendar/' + packageName
  })

  content = BANNER + content
  content = fcBuildUtils.renderSimpleTemplate(content, vars)

  return content
}
