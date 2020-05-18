const path = require('path')
const globby = require('globby')
const { externalizeRelative } = require('./scripts/lib/new-rollup')

/*
needs locales-all to run first
needs tsc to run first
*/

let tscLocaleFiles = globby.sync('packages/core/tsc/locales/*.js')
let bundleDirs = globby.sync('packages?(-premium)/bundle', { onlyDirectories: true })

module.exports = [

  // locales-all.js, for CORE
  {
    input: 'packages/core/tsc/locales-all.js',
    output: {
      format: 'es',
      file: 'packages/core/locales-all.js'
    },
    plugins: [
      externalizeRelative() // resulting bundle will import the individual locales
    ]
  },

  // locales-all.js, for BUNDLES
  {
    input: 'packages/core/tsc/locales-all.js',
    output: bundleDirs.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar',
      file: path.join(bundleDir, 'locales-all.js')
    })),
    plugins: [
      bundleWrapLocalesAll()
    ]
  },

  // locales/*.js, for CORE
  ...tscLocaleFiles.map((localeFile) => ({
    input: localeFile,
    output: {
      format: 'es',
      file: path.join('packages/core/locales', path.basename(localeFile))
    }
  })),

  // locales/*.js, for BUNDLES
  ...tscLocaleFiles.map((localeFile) => ({
    input: localeFile,
    output: bundleDirs.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar',
      file: path.join(bundleDir, 'locales', path.basename(localeFile))
    })),
    plugins: [
      bundleWrapLocalesEach()
    ]
  }))

]


function bundleWrapLocalesAll() {
  return {
    renderChunk(code) {
      return code.replace(/^var FullCalendar = /, 'FullCalendar.globalLocales = ')
    }
  }
}


function bundleWrapLocalesEach() {
  return {
    renderChunk(code) {
      return code.replace(/^var FullCalendar = /, 'FullCalendar.globalLocales.push')
    }
  }
}
