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
exports.distDirs = distDirs
exports.distLinks = distLinks
exports.vdomSwitch = vdomSwitch


/*
moves the tsc-generated locale files up one directory,
so they're accessible with import statements like '@fullcalendar/core/locales/es'
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



const PKG_DIRS = [
  'packages?(-premium)/*',
  '!packages?(-premium)/{bundle,__tests__}'
]

const fs = require('fs')

const exec = require('./scripts/lib/shell').sync.withOptions({
  live: true,
  exitOnError: true
})


async function distDirs() {
  let pkgDirs = await globby(PKG_DIRS, { onlyDirectories: true })

  return pkgDirs.forEach((pkgDir) => {
    let distDir = path.join(pkgDir, 'dist')
    let stat

    try {
      stat = fs.lstatSync(distDir)
    } catch (ex) {} // if doesn't exist

    if (stat && !stat.isDirectory()) {
      exec([ 'rm', '-rf', distDir ])
      stat = null
    }

    if (!stat) {
      exec([ 'mkdir', distDir ])
    }
  })
}


async function distLinks() {
  let pkgDirs = await globby(PKG_DIRS, { onlyDirectories: true })

  return pkgDirs.forEach((pkgDir) => {
    let distDir = path.join(pkgDir, 'dist')
    let stat

    try {
      stat = fs.lstatSync(distDir)
    } catch (ex) {} // if doesn't exist

    if (stat && !stat.isSymbolicLink()) {
      exec([ 'rm', '-rf', distDir ])
      stat = null
    }

    if (!stat) {
      exec([ 'ln', '-s', 'tsc', distDir ])
    }
  })
}


/*
NOTE: when flipping FULLCALENDAR_FORCE_REACT, you'll need to manually trigger a clean+rebuild
*/
async function vdomSwitch() {
  return Promise.resolve()

  let target = process.env.FULLCALENDAR_FORCE_REACT
    ? '../../../packages-contrib/react/src/vdom.ts'
    : '../../vdom-preact.ts'

  await exec([
    'ln', '-sf', target, 'packages/common/src/vdom-switch.ts'
  ])
}
