const path = require('path')
const gulp = require('gulp')
const modify = require('gulp-modify-file')
const generateDts = require('dts-generator').default
const tsConfig = require('../tsconfig.json')

let outFiles = []

gulp.task('ts-types', [ 'ts-types:raw' ], function() {
  return gulp.src(outFiles, { base: '.' })
    .pipe(
      modify(modifySource)
    )
    .pipe(
      gulp.dest('.')
    )
})

gulp.task('ts-types:raw', function() {
  let packagePaths = tsConfig.compilerOptions.paths
  let promises = []

  for (let packageName in packagePaths) {
    let packagePath = packagePaths[packageName][0]
    let outFile = 'dist/' + packageName + '/main.d.ts'

    promises.push(
      generateDts({
        baseDir: path.dirname(packagePath),
        files: [ path.basename(packagePath) ],
        name: packageName,
        out: outFile
      })
    )

    outFiles.push(outFile)
  }

  return Promise.all(promises)
})

// changes the name of the default export to `Default` and exports it as a *named* export.
// this allows ambient declaration merging to grab onto it.
// workaround for https://github.com/Microsoft/TypeScript/issues/14080
function modifySource(s) {
  return s.replace(/export default (abstract )?class ([\w]+)/g, function(m0, abstractStr, className) {
    if (!abstractStr) {
      abstractStr = ''
    }
    return `export { ${className} as default, ${className} };\n` +
      `${abstractStr} class ${className}`
  })
}
