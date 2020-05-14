const path = require('path')
const globby = require('globby')
const handlebars = require('handlebars')
const { src, dest, watch, parallel } = require('gulp')
const { readFile, writeFile } = require('./scripts/lib/util')
const fs = require('fs')

const SRC_LOCALE_DIR = 'packages/core/src/locales'
const SRC_LOCALE_EXT = '.ts'
const TSC_LOCALE_FILES = 'packages/core/dist/locales/*.{js,d.ts}'

exports.localesUp = localesUp
exports.localesUpWatch = localesUpWatch
exports.localesAll = localesAll
exports.localesAllWatch = localesAllWatch
exports.distDirs = distDirs
exports.distLinks = distLinks
exports.vdomLink = vdomLink


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
  '!packages?(-premium)/{core-vdom,bundle,__tests__}'
]

const exec = require('./scripts/lib/shell').sync.withOptions({
  live: true,
  exitOnError: true
  // TODO: flag for echoing command?
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


async function vdomLink() {
  let pkgRoot = 'packages/core-vdom'
  let outPath = path.join(pkgRoot, 'src/vdom.ts')
  let newTarget = // relative to outPath
    process.env.FULLCALENDAR_FORCE_REACT
      ? '../../../packages-contrib/react/src/vdom.ts'
      : 'vdom-preact.ts'

  let currentTarget

  try {
    currentTarget = fs.readlinkSync(outPath)
  } catch(ex) {} // if doesn't exist

  if (currentTarget && currentTarget !== newTarget) {
    exec([ 'rm', '-rf', outPath ])
    currentTarget = null

    console.log('Clearing tsbuildinfo because vdom symlink changed') // TODO: use gulp util?
    exec([ 'rm', '-rf', path.join(pkgRoot, 'tsconfig.tsbuildinfo') ])
  }

  if (!currentTarget) { // i.e. no existing symlink
    exec([ 'ln', '-s', newTarget, outPath ])
  }
}



const VDOM_FILE_MAP = {
  'packages/core-vdom/tsc/vdom.{js,d.ts}': 'packages/core/dist',
  'packages/common/tsc/vdom.{js,d.ts}': 'packages/common/dist'
}

exports.copyVDom = syncFiles(VDOM_FILE_MAP) // weird to put this here. TODO: remove comments?

function syncFiles(map) {
  return parallelMap(map, (srcGlob, destDir) => src(srcGlob).pipe(dest(destDir)))
}

function parallelMap(map, execute) {
  return parallel.apply(null, Object.keys(map).map((key) => {
    let task = () => execute(key, map[key])
    task.displayName = key
    return task
  }))
}
