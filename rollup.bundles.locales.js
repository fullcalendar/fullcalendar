const path = require('path')
const globby = require('globby')

/*
needs core locales to be built first
*/


const CORE_PKG_DIR = 'packages/core'
const BUNDLE_DIRS = [ // TODO: use glob!
  'packages/bundle',
  'packages-premium/bundle'
]


module.exports = [
  localeAllConfig(),
  ...localEachConfigs()
]


function localeAllConfig() {
  return {
    input: path.join(CORE_PKG_DIR, 'locales-all.js'),
    output: BUNDLE_DIRS.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar',
      dir: bundleDir
    })),
    plugins: [
      localeAllWrap()
    ]
  }
}


function localEachConfigs() {
  return globby.sync('locales/*.js', { cwd: CORE_PKG_DIR }).map((localeFile) => ({
    input: path.join(CORE_PKG_DIR, localeFile),
    output: BUNDLE_DIRS.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar',
      dir: bundleDir,
      entryFileNames: localeFile
    })),
    plugins: [
      localeEachWrap()
    ]
  }))
}


function localeAllWrap() {
  return {
    renderChunk(code) {
      return code.replace(/^var FullCalendar = /, 'FullCalendar.globalLocales = ')
    }
  }
}


function localeEachWrap() {
  return {
    renderChunk(code) {
      return code.replace(/^var FullCalendar = /, 'FullCalendar.globalLocales.push')
    }
  }
}
