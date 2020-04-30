const { parallel, series } = require('gulp')
const { shellTask } = require('./scripts/lib/util')
const { minifyJs, minifyCss } = require('./scripts/lib/minify') // combine into one task? make part of rollup?
const { lint } = require('./scripts/lib/lint')
const { archive } = require('./scripts/lib/archive')
const { writeLocales, watchLocales } = require('./scripts/lib/locales')
const { buildTestIndex } = require('./scripts/lib/tests-index')
const { runTsc, runTscWatch } = require('./scripts/lib/tsc')

exports.lint = lint
exports.archive = archive
exports.locales = writeLocales
exports.minify = parallel(minifyJs, minifyCss)

exports.build = series(
  () => runTsc(),
  writeLocales, // needs tsc
  () => buildTestIndex(), // needs tsc. needs to happen before rollup
  shellTask('npm:sass'),
  shellTask('npm:rollup'), // needs tsc, copied scss, generated locales
  parallel(minifyJs, minifyCss)
)

exports.watch = series(
  () => runTscWatch(),
  series(
    writeLocales, // needs tsc
    () => buildTestIndex(true), // needs tsc. watch=true
    shellTask('npm:sass'),
    parallel(
      shellTask('npm:sass:watch'), // double work :(
      shellTask('npm:rollup:watch'), // needs tsc, copied scss, generated locales
      watchLocales // TODO: ignore initial
    )
  )
) // doesn't minify!
// BUG: right after clean, when watching, tsc re-compiles a lot (must be watching something)
