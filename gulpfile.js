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



exports.archive = require('./scripts/lib/archive')



const linkPkgSubdirs = exports.linkPkgSubdirs = series(
  // rewire the @fullcalendar/angular package.
  // we still want yarn to install its dependencies,
  // but we want other packages to reference it by its dist/fullcalendar folder
  execTask('rm -f node_modules/@fullcalendar/angular'),
  execTask('ln -s ../../packages-contrib/angular/dist/fullcalendar node_modules/@fullcalendar/angular'),

  // same concept for fullcalendar-tests
  execTask('rm -f node_modules/fullcalendar-tests'),
  execTask('ln -s ../packages/__tests__/tsc node_modules/fullcalendar-tests')
)



/*
copy over the vdom files that were externalized by rollup.
we externalize these for two reasons:
 - when a consumer build system sees `import './vdom'` it's more likely to treat it with side effects.
 - rollup-plugin-dts was choking on the namespace declarations in the tsc-generated vdom.d.ts files.
*/
const VDOM_FILE_MAP = {
  'packages/core-vdom/tsc/vdom.{js,d.ts}': 'packages/core',
  'packages/common/tsc/vdom.{js,d.ts}': 'packages/common'
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
  linkPkgSubdirs,
  linkVDomLib,
  series(removeTscDevLinks, writeTscDevLinks), // for tsc
  localesAllSrc, // before tsc
  execTask('tsc -b --verbose'),
  localesDts,
  removeTscDevLinks,
  execTask('webpack --config webpack.bundles.js --env.NO_SOURCE_MAPS'), // always compile from SRC
  execTask('rollup -c rollup.locales.js'),
  process.env.FULLCALENDAR_FORCE_REACT
    ? async function() {} // rollup doesn't know how to make bundles for react-mode
    : execTask('rollup -c rollup.bundles.js'), // needs tsc, needs removeTscDevLinks
  execTask('rollup -c rollup.packages.js'),
  copyVDomMisc,
  minifyBundleJs,
  minifyBundleCss
)

exports.watch = series(
  linkPkgSubdirs,
  linkVDomLib,
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

exports.test = series(
  testsIndex,
  parallel(
    testsIndexWatch,
    execParallel({
      webpack: 'webpack --config webpack.tests.js --env.PACKAGE_MODE=src --watch',
      karma: 'karma start karma.config.js'
    })
  )
)

// note: if you want FULLCALENDAR_FORCE_REACT, you need to rebuild first, because of core-vdom
// TODO: rename FULLCALENDAR_FORCE_REACT to FORCE_TESTS_FROM_SOURCE for this case?
exports.testCi = series(
  linkVDomLib, // looks at FULLCALENDAR_FORCE_REACT (doesn't matter?)
  testsIndex,
  execTask(`webpack --config webpack.tests.js --env.PACKAGE_MODE=${process.env.FULLCALENDAR_FORCE_REACT ? 'src' : 'dist'}`), // react-mode cant do dist-mode
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



// depends on FULLCALENDAR_FORCE_REACT

exports.linkVDomLib = linkVDomLib

async function linkVDomLib() {
  let pkgRoot = 'packages/core-vdom'
  let outPath = path.join(pkgRoot, 'src/vdom.ts')
  let newTarget = process.env.FULLCALENDAR_FORCE_REACT
    ? '../../../packages-contrib/react/src/vdom.ts' // relative to outPath
    : 'vdom-preact.ts'

  if (process.env.FULLCALENDAR_FORCE_REACT) {
    console.log()
    console.log('CONNECTING TO REACT')
    console.log()
  }

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




const exec2 = require('./scripts/lib/shell').sync

exports.testsIndex = testsIndex
exports.testsIndexWatch = testsIndexWatch

async function testsIndex() {
  let res = exec2(
    'find packages*/__tests__/src -mindepth 2 -type f -print0 | ' +
    'xargs -0 grep -E "(fdescribe|fit)\\("'
  )

  if (!res.success && res.stderr) { // means there was a real error
    throw new Error(res.stderr)
  }

  let files

  if (!res.success) { // means there were no files that matched
    let { stdout } = exec2('find packages*/__tests__/src -mindepth 2 -type f')
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

exports.eslint = function() {
  let anyFailures = false

  for (let struct of allStructs) {
    if (struct.name !== '@fullcalendar/core-vdom') {
      let cmd = [
        'eslint', '--config', 'eslint.config.js',
        path.join(struct.dir, 'src'),
        '--ext', '.ts,.tsx,.js,.jsx'
      ]

      console.log('Running eslint on', struct.name, '...')
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

exports.stylelint = function() { // on BUILT css
  let anyFailures = false

  for (let struct of allStructs) {
    if (struct.name !== '@fullcalendar/core-vdom') {
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
  }

  if (anyFailures) {
    return Promise.reject(new Error('At least one linting job failed'))
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

    if (meta.module) {
      console.warn(`${struct.name} should NOT have a 'module' entry`)
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


exports.lint = series(exports.lintPackageMeta, exports.eslint)
