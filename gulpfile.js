const path = require('path')
const globby = require('globby')
const handlebars = require('handlebars')
const { src, dest, watch, parallel, series } = require('gulp')
const { readFile, writeFile } = require('./scripts/lib/util')
const fs = require('fs')
const exec = require('./scripts/lib/shell').sync.withOptions({ // always SYNC!
  live: true,
  exitOnError: true
  // TODO: flag for echoing command?
})

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
  let newTarget = process.env.FULLCALENDAR_FORCE_REACT
    ? '../../../packages-contrib/react/src/vdom.ts' // relative to outPath
    : 'vdom-preact.ts'

  let currentTarget
  try {
    currentTarget = fs.readlinkSync(outPath)
  } catch(ex) {} // if doesn't exist

  if (currentTarget && currentTarget !== newTarget) {
    exec([ 'rm', '-rf', outPath ])
    currentTarget = null

    console.log('Clearing tsbuildinfo because vdom symlink changed') // TODO: use gulp warn util?
    exec([ 'rm', '-rf', path.join(pkgRoot, 'tsconfig.tsbuildinfo') ])
  }

  if (!currentTarget) { // i.e. no existing symlink
    exec([ 'ln', '-s', newTarget, outPath ])
  }
}



/*
copy over the vdom files that were externalized by rollup.
we externalize these for two reasons:
 - when a consumer build system sees `import './vdom'` it's more likely to treat it with side effects.
 - rollup-plugin-dts was choking on the namespace declarations in the tsc-generated vdom.d.ts files.
*/
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





const exec2 = require('./scripts/lib/shell').sync

exports.testsIndex = testsIndex
exports.testsIndexWatch = testsIndexWatch

async function testsIndex() {
  let res = exec2(
    'find packages*/__tests__/tsc -mindepth 2 -name \'*.js\' -print0 | ' +
    'xargs -0 grep -E "(fdescribe|fit)\\("'
  )

  if (!res.success && res.stderr) { // means there was a real error
    throw new Error(res.stderr)
  }

  let files

  if (!res.success) { // means there were no files that matched
    let { stdout } = exec2('find packages*/__tests__/tsc -mindepth 2 -name \'*.js\'')
    files = stdout.trim()
    files = !files ? [] : files.split('\n')
    files = uniqStrs(files)
    files.sort() // work around OS-dependent sorting ... TODO: better sorting that knows about filename slashes
    console.log(`[test-index] All ${files.length} test files.`) // TODO: use gulp log util?

  } else {
    files = res.stdout.trim()
    files = !files ? [] : files.split('\n')
    files = files.map((line) => line.trim().split(':')[0]) // TODO: do a max split of 1
    files = uniqStrs(files)
    files.sort() // work around OS-dependent sorting
    console.log(
      '[test-index] Only test files that have fdescribe/fit:\n' + // TODO: use gulp log util?
      files.map((file) => ` - ${file}`).join('\n')
    )
  }

  let mainFiles = globby.sync('packages*/__tests__/tsc/main.js')
  files = mainFiles.concat(files)

  let code =
    files.map(
      (file) => `import ${JSON.stringify('./' + file)}`
    ).join('\n') +
    '\n'

  await writeFile('tests-index.js', code)
}

function testsIndexWatch() {
  return watch(
    [ 'packages/__tests__/tsc', 'packages-premium/__tests__/tsc' ], // wtf won't globs work for this?
    exports.testsIndex
  )
}

/*
TODO: make unnecessary. have grep do this instead with the -l option:
https://stackoverflow.com/questions/6637882/how-can-i-use-grep-to-show-just-filenames-on-linux
*/
function uniqStrs(a) {
  let hash = {}
  for (let item of a) {
    hash[item] = true
  }
  return Object.keys(hash)
}
