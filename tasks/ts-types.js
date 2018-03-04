const fs = require('fs')
const gulp = require('gulp')
const gutil = require('gulp-util')
const watch = require('gulp-watch') // better than gulp.watch because detects new files
const generateDts = require('dts-generator').default

gulp.task('ts-types', exec)

/*
Waits for fullcalendar.js to be created/modified before computing,
to avoid competing with and slowing down main build watcher.
*/
gulp.task('ts-types:watch', function() {
  watch('dist/fullcalendar.js', exec)
})

function exec() {
  gutil.log('Computing TypeScript definitions file...')
  return generateDts({
    project: '.', // where the tsconfig is
    name: 'fullcalendar',
    main: 'fullcalendar/src/main',
    out: 'tmp/fullcalendar.d.ts'
  }).then(function() {
    let content = fs.readFileSync('tmp/fullcalendar.d.ts', { encoding: 'utf8' })
    content = filterModuleDeclaration(content)
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist')
    }
    fs.writeFileSync('dist/fullcalendar.d.ts', content, { encoding: 'utf8' })
    gutil.log('Wrote TypeScript definitions file.')
  })
}

// Typedef Source Code Transformation Hacks
// ----------------------------------------

function filterModuleDeclaration(s) {
  return s.replace(
    /^declare module '([^']*)' \{([\S\s]*?)[\n\r]+\}/mg,
    function(whole, id, body) {
      return "declare module '" + filterModuleId(id) + "' {" + filterModuleBody(body) + '\n}'
    }
  )
}

function filterModuleId(id) {
  // fullcalendar/src/something/MyClass -> fullcalendar/MyClass
  return id.replace(
    /\/src\/([^/]*\/)*([A-Z][A-Za-z0-9]*)$/,
    '/$2'
  )
}

function filterModuleBody(s) {
  var defaultExportName

  // changes the name of the default export to `Default` and exports it as a *named* export.
  // this allows ambient declaration merging to grab onto it.
  // workaround for https://github.com/Microsoft/TypeScript/issues/14080
  s = s.replace(/export default( abstract)? class ([A-Z][A-Za-z0-9]*)/, function(m0, m1, m2) {
    defaultExportName = m2
    return 'export' + (m1 || '') + ' class Default'
  })

  if (defaultExportName) {
    // replace any references to the original class' name
    s = s.replace(new RegExp('\\b' + defaultExportName + '\\b'), 'Default')

    // still needs to be exported as default
    s += '\n\texport default Default;'
  }

  s = s.replace(/from '([^']*)'/g, function(whole, id) {
    return "from '" + filterModuleId(id) + "'"
  })

  return s
}
