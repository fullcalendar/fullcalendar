const path = require('path')
const globby = require('globby')
const handlebars = require('handlebars')
const { src, dest, watch } = require('gulp')
const { readFile, writeFile } = require('./scripts/lib/util')

const SRC_LOCALE_DIR = 'packages/core/src/locales'
const SRC_LOCALE_EXT = '.ts'
const TSC_LOCALE_FILES = 'packages/core/dist/locales/*.{js,d.ts}'

exports.localesUp = localesUp
exports.localesUpWatch = localesUpWatch
exports.localesAll = localesAll
exports.localesAllWatch = localesAllWatch


/*
moves the tsc-generated locale files up one directory,
so they're accessible with import statements like '@fullcalendar/core/locales/es.js'
requires tsc to run first.
*/
function localesUp() {
  return src(TSC_LOCALE_FILES)
    .pipe(dest('packages/core/locales/'))
}

function localesUpWatch() {
  return watch(TSC_LOCALE_FILES, localesUp)
}


async function localesAll() {
  let localeFileNames = await globby('*' + SRC_LOCALE_EXT, { cwd: SRC_LOCALE_DIR })
  let localeCodes = localeFileNames.map((fileName) => path.basename(fileName, SRC_LOCALE_EXT))
  let localeImportPaths = localeCodes.map((code) => `./locales/${code}`)

  let templateText = await readFile('packages/core/src/locales-all.js.tpl')
  let template = handlebars.compile(templateText)
  let jsText = template({
    localeImportPaths
  })

  return writeFile(
    'packages/core/locales-all.js',
    jsText
  )
}

function localesAllWatch() {
  return watch(SRC_LOCALE_DIR, localesAll)
}
