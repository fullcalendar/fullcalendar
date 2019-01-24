const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const gulp = require('gulp')
const shell = require('gulp-shell')

const tsConfig = require('../tsconfig.json')
const dirToPackage = buildDirToPackage()


gulp.task('dts', [ 'dts:refined', 'dts:verify' ])

gulp.task('dts:raw', shell.task(
  'tsc -p tsconfig.dts.json'
))

gulp.task('dts:verify', [ 'dts:refined' ], shell.task(
  'tsc --allowSyntheticDefaultImports --strict dist/*/*.d.ts'
))


gulp.task('dts:refined', [ 'dts:raw' ], function() {
  let rawContent = fs.readFileSync('tmp/all.d.ts', { encoding: 'utf8' })
  let contentByPackage = buildContentByPackage(rawContent)

  for (let packageName in contentByPackage) {
    let dir = 'dist/' + path.basename(packageName) // using path utils on normal strings :(
    mkdirp.sync(dir)

    fs.writeFileSync(
      dir + '/main.d.ts',
      contentByPackage[packageName]
    )
  }
})


/*
all tripple-slash directives will be removed. just dealing with module declarations
*/
function buildContentByPackage(content) {
  let chunksByPackage = buildChunksByPackage(content)
  let contentByPackage = {}

  for (let packageName in chunksByPackage) {
    contentByPackage[packageName] = chunksByPackage[packageName].join('\n\n')
  }

  return contentByPackage
}


function buildChunksByPackage(content) {
  let chunksByPackage = {}
  let MODULE_DECL_RE = /^declare module ['"]([^'"]*)['"] \{(\s*|([\S\s]*?)[\n\r]+)\}/mg // handles empty or big
  let match

  while ((match = MODULE_DECL_RE.exec(content))) {
    let pathParts = match[1].split('/')
    let packageDir = pathParts[0]
    let packageName = dirToPackage[packageDir]
    let packageChunks = chunksByPackage[packageName] || (chunksByPackage[packageName] = [])

    packageChunks.push(
      'declare module "' + transformModuleName(match[1]) + '" {' +
      transformModuleBody(match[2]) +
      '}'
    )
  }

  return chunksByPackage
}


/*
NOTE: this logic is overkill now that modules names are just '@fullcalendar/*'
*/
function transformModuleName(moduleName) {
  let parts = moduleName.split('/')

  if (parts.length > 1) { // one of our packages
    let packageName = dirToPackage[parts[0]]

    parts.shift() // remove first item, the dir name

    if (parts.length === 1 && parts[0] === 'main') {
      parts.shift() // completely empty!
    }

    parts.unshift(packageName)
  }

  return parts.join('/')
}


function transformModuleBody(content) {
  content = transformModuleBodyPaths(content)
  content = transformDefaultClassExports(content)

  return content
}


function transformModuleBodyPaths(content) {
  let IMPORT_RE = /import ['"]([^'"]*)['"]/g
  let IMPORT_FROM_RE = /from ['"]([^'"]*)['"]/g
  let INLINE_IMPORT_RE = /import\(['"]([^'"]*)['"]\)/g

  content = content.replace(IMPORT_RE, function(m0, m1) {
    return 'import "' + transformModuleName(m1) + '"'
  })

  content = content.replace(IMPORT_FROM_RE, function(m0, m1) {
    return 'from "' + transformModuleName(m1) + '"'
  })

  content = content.replace(INLINE_IMPORT_RE, function(m0, m1) {
    return 'import("' + transformModuleName(m1) + '")'
  })

  return content
}


// changes the name of the default export to `Default` and exports it as a *named* export.
// this allows ambient declaration merging to grab onto it.
// workaround for https://github.com/Microsoft/TypeScript/issues/14080
// NEEDED ANYMORE?
function transformDefaultClassExports(content) {
  return content.replace(/^(\s*)export default (abstract )?class ([\w]+)/mg, function(m0, m1, m2, m3) {
    return m1 + 'export { ' + m3 + ' as default, ' + m3 + ' };\n' +
      m1 + (m2 || '') + 'class ' + m3
  })
}


function buildDirToPackage() {
  let packagePaths = tsConfig.compilerOptions.paths
  let dirToPackage = {}

  for (let packageName in packagePaths) {
    let pathParts = packagePaths[packageName][0].split('/')
    dirToPackage[pathParts[1]] = packageName // src/[1]
  }

  return dirToPackage
}
