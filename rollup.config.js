import path from 'path'
import glob from 'glob'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import multiEntry from 'rollup-plugin-multi-entry'
import multiEntryArray from './rollup-plugin-multi-entry-array'
import sourcemaps from 'rollup-plugin-sourcemaps'
import rootPackageConfig from './package.json'
import tsConfig from './tsconfig.json'

let isDev
if (!/^(development|production)$/.test(process.env.BUILD)) {
  console.warn('BUILD environment not specified. Assuming \'development\'')
  isDev = true
} else {
  isDev = process.env.BUILD === 'development'
}

let packageGlobals = {
  luxon: 'luxon',
  moment: 'moment',
  'moment-timezone/builds/moment-timezone-with-data': 'moment', // see moment-timezone/main.ts
  rrule: 'rrule'
}

let packagePaths = tsConfig.compilerOptions.paths
let packageNames = Object.keys(packagePaths)

/*
KNOWN BUG: when watching test files that don't have any import statements, tsc transpiles ALL files.
*/
let watchOptions = {
  chokidar: true, // better than default watch util. doesn't fire change events on stat changes (like last opened)
  clearScreen: false // let tsc do the screan clearing
}

function getDefaultPlugins() { // need to be instantiated each time
  let plugins = [
    nodeResolve(), // for tslib
    commonjs() // for fast-deep-equal import
  ]

  if (isDev) {
    plugins.push(sourcemaps()) // for reading/writing sourcemaps
  }

  return plugins
}

for (let packageName of packageNames) {
  let packagePath = packagePaths[packageName][0]
  let packageDir = path.dirname(packagePath)
  let packageMeta = require('./' + packageDir + '/package.json')

  if (packageMeta.browserGlobal) {
    packageGlobals[packageName] = packageMeta.browserGlobal
  } else {
    console.log('NEED browserGlobal in package ' + packageName)
  }
}

let externalPackageNames = Object.keys(
  Object.assign(
    {},
    packageGlobals,
    rootPackageConfig.dependencies, // hopefully covered in packageGlobals
    rootPackageConfig.peerDependencies // (if not, rollup will give an error)
  )
)

export default [
  ...packageNames.map(buildPackageConfig),
  ...buildLocaleConfigs(),
  buildTestConfig()
]

function buildPackageConfig(packageName) {
  let packagePath = packagePaths[packageName][0]
  let packageDirName = path.basename(path.dirname(packagePath))

  return {
    onwarn,
    watch: watchOptions,
    input: 'tmp/tsc-output/' + packagePath + '.js',
    external: externalPackageNames,
    output: {
      file: 'dist/' + packageDirName + '/main.js',
      globals: packageGlobals,
      exports: 'named',
      name: packageGlobals[packageName],
      format: 'umd',
      sourcemap: isDev
    },
    plugins: getDefaultPlugins()
  }
}

function buildLocaleConfigs() {
  let localePaths = glob.sync('tmp/tsc-output/locales/*.js')
  let configs = []

  for (let localePath of localePaths) {
    let localeJsName = path.basename(localePath)
    let localeName = localeJsName.replace(/\..*$/, '')

    configs.push({
      onwarn,
      watch: watchOptions,
      input: localePath,
      external: externalPackageNames,
      output: {
        file: 'dist/core/locales/' + localeJsName,
        globals: packageGlobals,
        name: 'FullCalendarLocales.' + localeName,
        format: 'umd',
        sourcemap: isDev
      },
      plugins: getDefaultPlugins()
    })
  }

  // ALL locales in one file
  configs.push({
    onwarn,
    watch: watchOptions,
    input: localePaths,
    external: externalPackageNames,
    output: {
      file: 'dist/core/locales-all.js',
      globals: packageGlobals,
      name: 'FullCalendarLocalesAll',
      format: 'umd',
      sourcemap: isDev
    },
    plugins: getDefaultPlugins().concat([
      multiEntryArray()
    ])
  })

  return configs
}

function buildTestConfig() {
  return {
    onwarn,
    watch: watchOptions,
    input: [
      'tmp/tsc-output/tests/automated/globals.js', // needs to be first
      'tmp/tsc-output/tests/automated/**/*.js'
    ],
    external: externalPackageNames,
    output: {
      file: 'tmp/automated-tests.js',
      globals: packageGlobals,
      exports: 'none',
      format: 'umd',
      sourcemap: isDev
    },
    plugins: getDefaultPlugins().concat([
      multiEntry({
        exports: false // otherwise will complain about exported utils
      })
    ])
  }
}

function onwarn(warning, warn) {
  if (warning.code !== 'PLUGIN_WARNING') {
    // warn(warning)
  }
}
