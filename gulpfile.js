const { parallel, series } = require('gulp')
const { shellTask, whenFirstModified, fileExists, mkdirp } = require('./scripts/lib/util')
const { writePkgJsons } = require('./scripts/lib/pkg-json-write')
const { bundlPkgDefs } = require('./scripts/lib/pkg-dts')
const { writePkgReadmes } = require('./scripts/lib/pkg-readme')
const { writePkgLicenses } = require('./scripts/lib/pkg-license')
const { minifyJs, minifyCss } = require('./scripts/lib/minify') // combine into one task? make part of rollup?
const { lint } = require('./scripts/lib/lint')
const { archive } = require('./scripts/lib/archive')
const { writeLocales, watchLocales } = require('./scripts/lib/locales')
const { buildTestIndex } = require('./scripts/lib/tests-index')

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
  writeLocales, // needs tsc
  () => buildTestIndex(), // needs tsc. needs to happen before rollup
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
  parallel(
    shellTask('npm:tsc:watch'),
    series(
      waitTsc,
      writeLocales, // needs tsc
      () => buildTestIndex(), // needs tsc. needs to happen before rollup
      parallel(
        shellTask('npm:rollup:watch'), // needs tsc, copied scss, generated locales
        writePkgLicenses, // doesn't watch!
        writePkgReadmes, // doesn't watch!
        buildDts, // doesn't watch!
        watchLocales, // TODO: ignore initial
        () => buildTestIndex(true) // onlyWatch=true
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
