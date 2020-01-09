const { parallel, series } = require('gulp')
const { shellTask, whenFirstModified, fileExists, mkdirp } = require('./scripts/lib/util')
const { writePkgJsons } = require('./scripts/lib/pkg-json-write')
const { bundlPkgDefs } = require('./scripts/lib/pkg-dts')
const { writePkgReadmes } = require('./scripts/lib/pkg-readme')
const { writePkgLicenses } = require('./scripts/lib/pkg-license')
const { minifyJs, minifyCss } = require('./scripts/lib/minify') // combine into one task? make part of rollup?
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
  copyScss,
  shellTask('npm:tsc'),
  writeLocales, // needs tsc
  parallel(
    shellTask('npm:rollup'), // needs tsc, copied scss, generated locales
    writePkgLicenses,
    writePkgReadmes,
    buildDts
  ),
  parallel(minifyJs, minifyCss)
)

exports.watch = series(
  writePkgJsons, // important for node-resolution
  copyScss,
  parallel(
    shellTask('npm:tsc:watch'),
    series(
      waitTsc,
      writeLocales, // needs tsc
      parallel(
        shellTask('npm:rollup:watch'), // needs tsc, copied scss, generated locales
        writePkgLicenses, // doesn't watch!
        writePkgReadmes, // doesn't watch!
        buildDts, // doesn't watch!
        watchLocales, // TODO: ignore initial
        watchScss // TODO: ignore initial
      )
    )
  )
) // doesn't minify!
// BUG: right after clean, when watching, tsc re-compiles a lot (must be watching something)


async function waitTsc() {
  let dir = 'tmp/tsc-output' // TODO: make a constant
  let dirExists = await fileExists(dir)

  if (!dirExists) {
    await mkdirp(dir)
  }

  return whenFirstModified(dir, { delay: 1000, disableGlobbing: true })
}
