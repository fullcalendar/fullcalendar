const fs = require('fs')
const path = require('path')
const globby = require('globby')
const handlebars = require('handlebars')
const { src, dest, parallel, series } = require('gulp')
const { readFile, writeFile, watch } = require('./scripts/lib/util')
const replace = require('gulp-replace')
const exec = require('./scripts/lib/shell').sync.withOptions({ // always SYNC!
  live: true,
  exitOnError: true
  // TODO: flag for echoing command?
})
const concurrently = require('concurrently')
const { minifyBundleJs, minifyBundleCss } = require('./scripts/lib/minify')
const modify = require('gulp-modify-file')
const { allStructs, publicPackageStructs } = require('./scripts/lib/package-index')
const semver = require('semver')
const { eslintAll } = require('./scripts/eslint-dir')



exports.archive = require('./scripts/lib/archive')


/*
copy over the vdom files that were externalized by rollup.
we externalize these for two reasons:
 - when a consumer build system sees `import './vdom'` it's more likely to treat it with side effects.
 - rollup-plugin-dts was choking on the namespace declarations in the tsc-generated vdom.d.ts files.
*/
const VDOM_FILE_MAP = {
  'packages/core-preact/tsc/vdom.d.ts': 'packages/core',
  'packages/common/tsc/vdom.d.ts': 'packages/common'
}

const copyVDomMisc = exports.copyVDomMisc = parallelMap(
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



const localesDts = exports.localesDts = parallel(localesAllDts, localesEachDts)

function localesAllDts() { // needs tsc
  return src('packages/core/tsc/locales-all.d.ts')
    .pipe(removeSimpleComments())
    .pipe(dest('packages/core'))
}

function localesEachDts() { // needs tsc
  return src('packages/core/tsc/locales/*.d.ts')
    .pipe(removeSimpleComments())
    .pipe(dest('packages/core/locales')) // TODO: remove sourcemap comment
}

function removeSimpleComments() { // like a gulp plugin
  return modify(function(code) { // TODO: use gulp-replace instead
    return code.replace(/\/\/.*/g, '') // TODO: make a general util for this
  })
}



exports.build = series(
  series(removeTscDevLinks, writeTscDevLinks), // for tsc
  localesAllSrc, // before tsc
  execTask('tsc -b --verbose'),
  localesDts,
  removeTscDevLinks,
  execTask('webpack --config webpack.bundles.js --env NO_SOURCE_MAPS'), // always compile from SRC
  execTask('rollup -c rollup.locales.js'),
  execTask('rollup -c rollup.bundles.js'),
  execTask('rollup -c rollup.packages.js'),
  copyVDomMisc,
  minifyBundleJs,
  minifyBundleCss
)

exports.watch = series(
  series(removeTscDevLinks, writeTscDevLinks), // for tsc
  localesAllSrc, // before tsc
  execTask('tsc -b --verbose'), // initial run
  localesDts, // won't watch :(
  parallel(
    localesAllSrcWatch,
    execParallel({
      tsc: 'tsc -b --watch --preserveWatchOutput --pretty', // wont do pretty bc of piping
      bundles: 'webpack --config webpack.bundles.js --watch',
      locales: 'rollup -c rollup.locales.js --watch' // operates on src files. fyi: tests will need this instantly, if compiled together
    })
  )
)

exports.testsIndex = testsIndex

exports.test = series(
  testsIndex,
  parallel(
    testsIndexWatch,
    execParallel({
      webpack: 'webpack --config webpack.tests.js --watch --env PACKAGES_FROM_SOURCE',
      karma: 'karma start karma.config.js'
    })
  )
)

exports.testCi = series(
  testsIndex,
  execTask('webpack --config webpack.tests.js'),
  execTask('karma start karma.config.js ci')
)



const LOCALES_SRC_DIR = 'packages/core/src/locales'
const LOCALES_ALL_TPL = 'packages/core/src/locales-all.ts.tpl'
const LOCALES_ALL_DEST = 'packages/core/src/locales-all.ts'

exports.localesAllSrc = localesAllSrc
exports.localesAllSrcWatch = localesAllSrcWatch

async function localesAllSrc() {
  let localeFileNames = await globby('*.ts', { cwd: LOCALES_SRC_DIR })
  let localeCodes = localeFileNames.map((fileName) => path.basename(fileName, '.ts'))
  let localeImportPaths = localeCodes.map((localeCode) => `./locales/${localeCode}`)

  let templateText = await readFile(LOCALES_ALL_TPL)
  let template = handlebars.compile(templateText)
  let jsText = template({
    localeImportPaths
  })

  await writeFile(LOCALES_ALL_DEST, jsText)
}

function localesAllSrcWatch() {
  return watch([ LOCALES_SRC_DIR, LOCALES_ALL_TPL ], localesAllSrc)
}



exports.writeTscDevLinks = series(removeTscDevLinks, writeTscDevLinks)
exports.removeTscDevLinks = removeTscDevLinks

async function writeTscDevLinks() { // bad name. does js AND .d.ts. is it necessary to do the js?
  for (let struct of publicPackageStructs) {
    let jsOut = path.join(struct.dir, struct.mainDistJs)
    let dtsOut = path.join(struct.dir, struct.mainDistDts)

    exec([
      'mkdir',
      '-p',
      path.dirname(jsOut),
      path.dirname(dtsOut),
    ])

    exec([ 'ln', '-s', struct.mainTscJs, jsOut ])
    exec([ 'ln', '-s', struct.mainTscDts, dtsOut ])
  }
}

async function removeTscDevLinks() {
  for (let struct of publicPackageStructs) {
    let jsLink = path.join(struct.dir, struct.mainDistJs)
    let dtsLink = path.join(struct.dir, struct.mainDistDts)

    exec([ 'rm', '-f', jsLink, dtsLink ])
  }
}




const exec2 = require('./scripts/lib/shell').sync

exports.testsIndex = testsIndex
exports.testsIndexWatch = testsIndexWatch

async function testsIndex() {
  let res = exec2(
    "find packages*/__tests__/src -mindepth 2 -type f \\( -name '*.ts' -or -name '*.tsx' \\) -print0 | " +
    'xargs -0 grep -E "(fdescribe|fit)\\("'
  )

  if (!res.success && res.stderr) { // means there was a real error
    throw new Error(res.stderr)
  }

  let files

  if (!res.success) { // means there were no files that matched
    let { stdout } = exec2("find packages*/__tests__/src -mindepth 2 -type f \\( -name '*.ts' -or -name '*.tsx' \\)")
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

  let mainFiles = globby.sync('packages*/__tests__/src/main.{js,ts}')
  files = mainFiles.concat(files)

  // need 'contrib:ci' to have already been run
  if (process.env.FULLCALENDAR_FORCE_REACT) {
    files = [ 'packages-contrib/react/dist/vdom.js' ].concat(files)
  }

  let code =
    files.map(
      (file) => `import ${JSON.stringify('../../' + file)}`
    ).join('\n') +
    '\n'

  await writeFile('tmp/tests/index.js', code)
}

function testsIndexWatch() {
  return watch(
    [ 'packages/__tests__/src', 'packages-premium/__tests__/src' ], // wtf won't globs work for this?
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



function execTask(args) {
  const exec = require('./scripts/lib/shell').promise.withOptions({ live: true })
  let name = Array.isArray(args) ? args[0] : args.match(/\w+/)[0]
  let taskFunc = () => exec(args)
  taskFunc.displayName = name
  return taskFunc
}

function execParallel(map) {
  let taskArray = []

  for (let taskName in map) {
    taskArray.push({ name: taskName, command: map[taskName] })
  }

  let func = () => concurrently(taskArray, { killOthers: ['failure'] })
  func.displayName = 'concurrently'
  return func
}



const exec3 = require('./scripts/lib/shell').sync.withOptions({
  live: true,
  exitOnError: false
})


exports.lintBuiltCss = function() {
  let anyFailures = false

  for (let struct of publicPackageStructs) {
    let builtCssFile = path.join(struct.dir, 'main.css')

    if (fs.existsSync(builtCssFile)) {
      let cmd = [
        'stylelint', '--config', 'stylelint.config.js',
        builtCssFile
      ]

      console.log('Running stylelint on', struct.name, '...')
      console.log(cmd.join(' '))
      console.log()

      let { success } = exec3(cmd)
      if (!success) {
        anyFailures = true
      }
    }
  }

  if (anyFailures) {
    return Promise.reject(new Error('At least one linting job failed'))
  }

  return Promise.resolve()
}


exports.lintBuiltDts = function() {
  let anyFailures = false

  for (let struct of publicPackageStructs) {
    let dtsFile = path.join(struct.dir, 'main.d.ts')
    console.log(`Checking ${dtsFile}`)

    // look for bad module declarations (when relative, assumed NOT to be ambient, so BAD)
    // look for references to react/preact (should always use vdom instead)
    let { stdout } = require('./scripts/lib/shell').sync([
      'grep', '-iEe', '(declare module [\'"]\\.|p?react)', dtsFile
    ])
    stdout = stdout.trim()
    if (stdout) { // don't worry about failure. grep gives failure if no results
      console.log('  BAD: ' + stdout)
      anyFailures = true
    }

    if (struct.isPremium && struct.name !== '@fullcalendar/premium-common') {
      let { stdout: stdout2 } = require('./scripts/lib/shell').sync([
        'grep', '-e', '@fullcalendar/premium-common', dtsFile
      ])
      stdout2 = stdout2.trim()
      if (!stdout2) {
        console.warn(`The premium package ${struct.name} does not have @fullcalendar/premium-common reference in .d.ts`)
        anyFailures = true
      }
    }

    console.log()
  }

  if (anyFailures) {
    return Promise.reject(new Error('At least one dts linting job failed'))
  }

  return Promise.resolve()
}


const REQUIRED_TSLIB_SEMVER = '2'

exports.lintPackageMeta = function() {
  let success = true

  for (let struct of publicPackageStructs) {
    let { meta } = struct

    if (!meta.main) {
      console.warn(`${struct.name} should have a 'main' entry`)
      success = false
    }

    if (!meta.module) {
      console.warn(`${struct.name} should have a 'module' entry`)
      success = false
    }

    if (meta.dependencies && meta.dependencies['@fullcalendar/core']) {
      console.warn(`${struct.name} should have @fullcalendar/common as a dep, NOT @fullcalendar/core`)
      success = false
    }

    let tslibSemver = (meta.dependencies || {}).tslib || ''

    if (!tslibSemver || !semver.intersects(tslibSemver, REQUIRED_TSLIB_SEMVER)) {
      console.warn(`${struct.name} has a tslib version ('${tslibSemver}') that does not satisfy '${REQUIRED_TSLIB_SEMVER}'`)
      success = false
    }

    if (!fs.existsSync(path.join(struct.dir, '.npmignore'))) {
      console.warn(`${struct.name} needs a .npmignore file`)
      success = false
    }
  }

  if (success) {
    return Promise.resolve()
  } else {
    return Promise.reject(new Error('At least one package.json has an error'))
  }
}


exports.lint = series(exports.lintPackageMeta, () => {
  return eslintAll() ? Promise.resolve() : Promise.reject(new Error('One or more lint tasks failed'))
})

exports.lintBuilt = series(exports.lintBuiltCss, exports.lintBuiltDts)
