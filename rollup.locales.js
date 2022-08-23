const path = require('path')
const globby = require('globby')
const esbuild = require('rollup-plugin-esbuild').default
const { externalizeRelative } = require('./scripts/lib/new-rollup')

/*
needs locales-all to run first

compiles from *SRC* files.
we use sucrase to transpile the ts files.
normally we wouldn't use sucrase because it produces JS that's too advanced for the browsers we want to support,
but the locale files are simple so it'll be fine.
*/

let srcLocaleFiles = globby.sync('packages/core/src/locales/*.ts')
let bundleDirs = globby.sync('packages?(-premium)/bundle', { onlyDirectories: true })
let esbuildInstance = esbuild({
  target: 'ie11',
})

module.exports = [

  // locales-all.js, for CORE
  {
    input: 'packages/core/src/locales-all.ts',
    output: {
      format: 'cjs',
      exports: 'named',
      file: 'packages/core/locales-all.js'
    },
    plugins: [
      externalizeRelative(), // resulting bundle will import the individual locales
      dumbDownInputForIE11(),
      esbuildInstance
    ]
  },

  // locales-all.js, for BUNDLES
  {
    input: 'packages/core/src/locales-all.ts',
    output: bundleDirs.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar', // for bundleWrapLocalesAll
      file: path.join(bundleDir, 'locales-all.js')
    })).concat({
      format: 'iife',
      name: 'FullCalendar', // for bundleWrapLocalesAll
      file: path.join('packages/core/locales-all.global.js') // FOR CORE
    }),
    plugins: [
      dumbDownInputForIE11(),
      esbuildInstance,
      bundleWrapLocalesAll()
    ]
  },

  // locales/*.js, for CORE
  ...srcLocaleFiles.map((srcLocaleFile) => ({
    input: srcLocaleFile,
    output: {
      format: 'cjs',
      exports: 'named',
      file: path.join('packages/core/locales', path.basename(srcLocaleFile, '.ts') + '.js')
    },
    plugins: [
      dumbDownInputForIE11(),
      esbuildInstance
    ]
  })),

  // locales/*.js, for BUNDLES
  ...srcLocaleFiles.map((srcLocaleFile) => ({
    input: srcLocaleFile,
    output: bundleDirs.map((bundleDir) => ({
      format: 'iife',
      name: 'FullCalendar', // for bundleWrapLocalesAll
      file: path.join(bundleDir, 'locales', path.basename(srcLocaleFile, '.ts') + '.js')
    })).concat({
      format: 'iife',
      name: 'FullCalendar', // for bundleWrapLocalesAll
      file: path.join('packages/core/locales', path.basename(srcLocaleFile, '.ts') + '.global.js') // FOR CORE
    }),
    plugins: [
      dumbDownInputForIE11(),
      esbuildInstance,
      bundleWrapLocalesEach()
    ]
  }))

]


function bundleWrapLocalesAll() {
  return {
    renderChunk(code) {
      return code.replace(/^var FullCalendar = \(/, '[].push.apply(FullCalendar.globalLocales, ') // needs to be by-reference. can't reassign
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


// needs to go before esbuild
function dumbDownInputForIE11() {
  return {
    transform(code) {
      code = code.replace(/\bconst\b/g, 'var')
      code = code.replace(/(\w+)(\([\w:, ]*\)\s*{)/g, '$1: function$2')
      return code
    }
  }
}
