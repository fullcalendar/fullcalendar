const path = require('path')
const glob = require('glob')
const handleBars = require('handlebars')
const { readFile, writeFile, watch } = require('./util')
const { getCorePkgStruct } = require('./pkg-struct')
const { src, dest, parallel } = require('gulp')


let corePkg = getCorePkgStruct()
const LOCALES_GLOB = 'locales/*.js'
const writeLocales = parallel(copyLocalesFromTsc, generateLocalesAll)

function watchLocales() {
  return watch(LOCALES_GLOB, { cwd: corePkg.srcDir }, writeLocales)
}

exports.writeLocales = writeLocales
exports.watchLocales = watchLocales



function copyLocalesFromTsc() { // to core's dist dir
  return src(LOCALES_GLOB, { cwd: corePkg.tscDir, base: corePkg.tscDir })
    .pipe(dest(corePkg.dir))
}


async function generateLocalesAll() {
  let templateText = await readFile(path.join(corePkg.srcDir, 'locales-all.js.tpl'))
  let template = handleBars.compile(templateText)

  let localePaths = glob.sync('./' + LOCALES_GLOB, { cwd: corePkg.srcDir }) // starting ./ for import statements
  let jsText = template({
    localePaths
  })

  return writeFile(
    path.join(corePkg.dir, 'locales-all.js'),
    jsText
  )
}
