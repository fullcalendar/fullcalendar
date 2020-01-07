const path = require('path')
const glob = require('glob')
const handleBars = require('handlebars')
const { readFile, writeFile } = require('./util')
const { getCorePkgStruct, getNonPremiumBundle } = require('./pkg-struct')
const { src, dest, parallel } = require('gulp')


exports.writeLocales = parallel(copyLocalesFromTsc, generateLocalesAll)

// TODO: write a watcher


let corePkg = getCorePkgStruct()


function copyLocalesFromTsc() { // to core's dist dir
  return src('locales/*.js', { cwd: corePkg.tscDir, base: corePkg.tscDir })
    .pipe(dest(corePkg.distDir))
}


async function generateLocalesAll() {
  let templateText = await readFile(path.join(corePkg.dir, 'locales-all.js.tpl'))
  let template = handleBars.compile(templateText)

  let localePaths = glob.sync('./locales/*.js', { cwd: corePkg.srcDir })
  let jsText = template({
    localePaths
  })

  return writeFile(
    path.join(corePkg.distDir, 'locales-all.js'),
    jsText
  )
}
