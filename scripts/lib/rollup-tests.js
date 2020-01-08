const path = require('path')
const glob = require('glob')
const multiEntry = require('rollup-plugin-multi-entry')
const nodeResolve = require('rollup-plugin-node-resolve')
const alias = require('rollup-plugin-alias')
const scss = require('rollup-plugin-scss')
const commonjs = require('rollup-plugin-commonjs')
const sourcemaps = require('rollup-plugin-sourcemaps')
const { EXTERNAL_BROWSER_GLOBALS, WATCH_OPTIONS, stripScssTildeImporter, onwarn } = require('./rollup-util')


module.exports = function() {
  return [
    buildMainConfig(),
    buildForManuaTests()
  ]
}


function buildMainConfig() {
  let nodeModulesDirs = [
    'packages/__tests__/node_modules',
    'packages-premium/__tests__/node_modules'
  ]

  return {
    input: [
      'tmp/tsc-output/packages?(-premium)/__tests__/src/globals.js',
      'tmp/tsc-output/packages?(-premium)/__tests__/src/**/*.js',
      '!tmp/tsc-output/packages?(-premium)/__tests__/src/for-manual/**'
    ],
    output: {
      file: 'tmp/tests.js',
      format: 'iife',
      globals: EXTERNAL_BROWSER_GLOBALS,
      sourcemap: true
    },
    // HACK: because hoisting is no yet implemented for the monorepo-tool, when we require our packages,
    // *their* dependencies are not deduped, we we get multiple instances of the below libraries in the bundle.
    // Until hoisting is implemented, make these external and include them manually from karma.config.js.
    external: Object.keys(EXTERNAL_BROWSER_GLOBALS).concat([
      'moment/locale/es'
    ]),
    plugins: [
      multiEntry({
        exports: false // don't combine all the exports. no need, and would collide
      }),
      nodeResolve({
        customResolveOptions: {
          paths: nodeModulesDirs
        }
      }),
      alias({
        // the alias to the non-premium tests. must be absolute
        'package-tests': path.join(process.cwd(), 'tmp/tsc-output/packages/__tests__/src')
      }),
      scss({
        includePaths: nodeModulesDirs,
        importer: stripScssTildeImporter
      }),
      commonjs(), // for fast-deep-equal import
      sourcemaps()
    ],
    watch: WATCH_OPTIONS,
    onwarn
  }
}


function buildForManuaTests() {
  return {
    input: glob.sync('tmp/tsc-output/packages?(-premium)/__tests__/src/for-manual/**/*.js'),
    external: Object.keys(EXTERNAL_BROWSER_GLOBALS),
    output: {
      dir: 'tmp/tests-manual',
      format: 'iife',
      globals: EXTERNAL_BROWSER_GLOBALS
    },
    plugins: [
      nodeResolve()
    ]
  }
}
