const { parallel, series } = require('gulp')
const { shellTask, watch } = require('./scripts/lib/util')
const { writePkgJsons } = require('./scripts/lib/pkg-json-write')
const { bundlPkgDefs } = require('./scripts/lib/pkg-dts')
const { writePkgReadmes } = require('./scripts/lib/pkg-readme')
const { writePkgLicenses } = require('./scripts/lib/pkg-license')
const { minifyJs, minifyCss } = require('./scripts/lib/minify') // combine into one task?
const { lint } = require('./scripts/lib/lint')
const { archive } = require('./scripts/lib/archive')
const { copyScss, watchScss } = require('./scripts/lib/pkg-scss') // watchScss is a bad name!
const { writeLocales, watchLocales } = require('./scripts/lib/locales')

const buildDts = exports.dts = series(
  shellTask('npm:tsc:dts'), // generates granular .d.ts files
  bundlPkgDefs // combines them
)

exports.lint = lint
exports.archive = archive
exports.json = writePkgJsons
exports.readme = writePkgReadmes
exports.license = writePkgLicenses
exports.locales = writeLocales
exports.minify = parallel(minifyJs, minifyCss)

exports.build = series(
  writePkgJsons, // important for node-resolution
  shellTask('npm:tsc'),
  parallel(
    shellTask('npm:rollup'),
    writePkgLicenses,
    writePkgReadmes,
    writeLocales, // needs tsc
    copyScss,
    buildDts
  ),
  parallel(minifyJs, minifyCss)
)


exports.watch = series(
  writePkgJsons, // important for node-resolution. doesn't watch!
  shellTask('npm:tsc:debug'),
  parallel(
    shellTask('npm:tsc:watch'), // TODO: better system. does two consecutive compiles
    shellTask('npm:rollup:watch'),
    writePkgLicenses, // doesn't watch!
    writePkgReadmes, // doesn't watch!
    watchLocales,
    watchScss,
    watchLocales, // needs tsc
    watchScss,
    buildDts // doesn't watch!
  )
  // doesn't minify!
)
