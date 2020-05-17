const path = require('path')
const globby = require('globby')
const handlebars = require('handlebars')
const { src, dest, watch, parallel, series } = require('gulp')
const { readFile, writeFile } = require('./scripts/lib/util')
const fs = require('fs')
const replace = require('gulp-replace')
const exec = require('./scripts/lib/shell').sync.withOptions({ // always SYNC!
  live: true,
  exitOnError: true
  // TODO: flag for echoing command?
})

const TSC_LOCALE_DIR = 'packages/core/tsc/locales'
const TSC_LOCALE_EXT = '.js'
const TSC_LOCALE_FILES = 'packages/core/tsc/locales/*.{js,d.ts}'

exports.localesUp = localesUp
exports.localesUpWatch = localesUpWatch
exports.localesAll = localesAll
exports.localesAllWatch = localesAllWatch
exports.vdomLink = vdomLink


// TODO: rename to coreLocalesUp/etc
/*
moves the tsc-generated locale files up one directory,
so they're accessible with import statements like '@fullcalendar/core/locales/es'
requires tsc to run first.
*/
function localesUp() {
  return src(TSC_LOCALE_FILES) // will watch new files???
    .pipe(replace(/\/\/.*/g, '')) // remove sourcemap comments
    .pipe(dest('packages/core/locales/'))
}

function localesUpWatch() {
  return watch(TSC_LOCALE_FILES, localesUp)
}


async function localesAll() {
  let localeFileNames = await globby('*' + TSC_LOCALE_EXT, { cwd: TSC_LOCALE_DIR })
  let localeCodes = localeFileNames.map((fileName) => path.basename(fileName, TSC_LOCALE_EXT ))
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
  return watch(TSC_LOCALE_DIR, localesAll)
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


exports.dtsLinks = dtsLinks
exports.dtsClear = dtsClear

const PKG_DIRS2 = [
  'packages?(-premium)/*',
  '!packages?(-premium)/{bundle,__tests__}' // includes core-vdom
]

async function dtsLinks() {
  let pkgDirs = await globby(PKG_DIRS2, { onlyDirectories: true })

  return pkgDirs.forEach((pkgDir) => {
    exec([ 'mkdirp', path.join(pkgDir, 'dist') ])
    exec([ 'ln', '-sF', '../tsc/main.d.ts', path.join(pkgDir, 'dist/main.d.ts') ]) // F will remove dir first. use elsewhere!!!!
  })
}

async function dtsClear() { // need this or else .d.ts symlink dest gets overriden???
  let pkgDirs = await globby(PKG_DIRS2, { onlyDirectories: true })

  return pkgDirs.forEach((pkgDir) => {
    exec([ 'rm', '-f', path.join(pkgDir, 'dist/main.d.ts') ])
  })
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

exports.copyVDom = parallelMap(
  VDOM_FILE_MAP,
  (srcGlob, destDir) => src(srcGlob)
    .pipe(replace(/\/\/.*/g, '')) // remove sourcemap comments and ///<reference> don in rollup too
    .pipe(dest(destDir))
)

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
      (file) => `import ${JSON.stringify('../' + file)}`
    ).join('\n') +
    '\n'

  await writeFile('tests-output/index.js', code)
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
