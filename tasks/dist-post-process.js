const path = require('path')
const gulp = require('gulp')
const modify = require('gulp-modify-file')
const rootPackageConfig = require('../package.json')

gulp.task('dist-post-process', function() {
  return gulp.src('dist/*/*.{js,css}', { base: '.' })
    .pipe(
      modify(modifySource)
    )
    .pipe(
      gulp.dest('.')
    )
})

const BANNER =
  '/*!\n' +
  '<%= name %> v<%= version %>\n' +
  'Docs & License: <%= homepage %>\n' +
  '(c) <%= copyright %>\n' +
  '*/\n'

function modifySource(content, filePath) {
  let packageName = path.basename(path.dirname(filePath))
  let vars = Object.assign(rootPackageConfig, {
    name: packageName
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
