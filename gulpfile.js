const { parallel, series } = require('gulp')
const { shellTask } = require('./scripts/lib/util')
const { writePkgJsons } = require('./scripts/lib/pkg-json-write')
const { bundlPkgDefs } = require('./scripts/lib/pkg-dts')
const { writePkgReadmes } = require('./scripts/lib/pkg-readme')
const { writePkgLicenses } = require('./scripts/lib/pkg-license')
const { minifyJs, minifyCss } = require('./scripts/lib/minify')
const { lint } = require('./scripts/lib/lint')
const { archive } = require('./scripts/lib/archive')


const buildJs = exports.buildJs = series(
  writePkgJsons, // important for node-resolution
  shellTask('npm:tsc'),
  shellTask('npm:rollup')
)

const watchJs = exports.watchJs = series(
  writePkgJsons, // important for node-resolution
  shellTask('npm:tsc:debug'),
  parallel(
    shellTask('npm:tsc:watch'), // will be fast 2nd time b/c of incremental:true
    shellTask('npm:rollup:watch')
  )
)

const buildDts = exports.dts = series(
  shellTask('npm:tsc:dts'), // generates granular .d.ts files
  bundlPkgDefs // combines them
)

exports.build = parallel(
  writePkgLicenses,
  writePkgReadmes,
  buildDts,
  series(
    buildJs,
    minifyJs
  ),
  series(
    shellTask('npm:sass'),
    minifyCss
  )
)

exports.watch = parallel( // doesn't do everything build does
  watchJs,
  shellTask('npm:sass:watch')
)

exports.minify = parallel(minifyJs, minifyCss)

exports.lint = lint
exports.archive = archive
exports.json = writePkgJsons
exports.readme = writePkgReadmes
exports.license = writePkgLicenses
