const path = require('path')
const gulp = require('gulp')
const shell = require('gulp-shell')
const modify = require('gulp-modify-file')
const rootPackageConfig = require('../package.json')

gulp.task('build', [ 'build:raw' ], function() {
  return gulp.src('dist/*/*.{js,css}', { base: '.' })
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
  '<%= name %> v<%= version %>\n' +
  'Docs & License: <%= homepage %>\n' +
  '(c) <%= copyright %>\n' +
  '*/\n'

function modifySource(content, filePath) {
  let packageName = path.basename(path.dirname(filePath))
  let vars = Object.assign(rootPackageConfig, {
    name: '@fullcalendar/' + packageName // TODO: unite this logic
  })

  content = BANNER + content

  content = content.replace(
    /<%=\s*(\w+)\s*%>/g,
    function(wholeMatch, varName) {
      return vars[varName] || ''
    }
  )

  return content
}
