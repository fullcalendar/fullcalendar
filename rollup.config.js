import path from 'path'
import glob from 'glob'
import resolve from 'rollup-plugin-node-resolve'
import multiEntry from 'rollup-plugin-multi-entry'
import sourcemaps from 'rollup-plugin-sourcemaps'
import rootPackageConfig from './package.json'
import tsConfig from './tsconfig.json'

let isDev
if (!/^(development|production)$/.test(process.env.BUILD)) {
  console.warn('BUILD environment not specified. Assuming \'development\'')
  isDev = true
} else {
  isDev = process.env.BUILD == 'development'
}

let packagePaths = tsConfig.compilerOptions.paths
let packageNames = Object.keys(packagePaths)
let packageGlobals = {
  superagent: 'superagent',
  luxon: 'luxon',
  moment: 'moment',
  rrule: 'rrule',
  fullcalendar: 'FullCalendar'
}

/*
KNOWN BUG: when watching test files that don't have any import statements, tsc transpiles ALL files.
*/
let watchOptions = {
  chokidar: true, // better than default watch util. doesn't fire change events on stat changes (like last opened)
  clearScreen: false // let tsc do the screan clearing
}

for (let packageName of packageNames) {
  if (!packageGlobals[packageName]) {
    packageGlobals[packageName] = 'FullCalendarPlugins.' + packageName
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
  return {
    onwarn,
    watch: watchOptions,
    input: 'tmp/tsc-output/' + packagePaths[packageName][0] + '.js',
    external: externalPackageNames,
    output: {
      file: 'dist/' + packageName + '/main.js',
      globals: packageGlobals,
      exports: 'named',
      name: packageGlobals[packageName],
      format: 'umd',
      sourcemap: isDev,
      sourcemapExcludeSources: true
    },
    plugins: [
      resolve(), // for tslib
      sourcemaps() // for processing tsc's sourcemaps
    ]
  }
}

function buildLocaleConfigs() {
  let localePaths = glob.sync('tmp/tsc-output/locales/*.js')
  let configs = []

  for (let localePath of localePaths) {
    configs.push({
      onwarn,
      watch: watchOptions,
      input: localePath,
      external: externalPackageNames,
      output: {
        file: 'dist/fullcalendar/locales/' + path.basename(localePath),
        globals: packageGlobals,
        exports: 'none',
        format: 'umd'
      },
      plugins: [
        resolve() // for tslib
      ]
    })
  }

  // ALL locales in one file
  configs.push({
    onwarn,
    watch: watchOptions,
    input: localePaths,
    external: externalPackageNames,
    output: {
      file: 'dist/fullcalendar/locales-all.js',
      globals: packageGlobals,
      exports: 'none',
      format: 'umd'
    },
    plugins: [
      resolve(), // for tslib
      multiEntry()
    ]
  })

  return configs
}

function buildTestConfig() {
  return   {
    onwarn,
    watch: watchOptions,
    input: [
      'tmp/tsc-output/tests/automated/globals.js',
      'tmp/tsc-output/tests/automated/hacks.js',
      'tmp/tsc-output/tests/automated/**/*.js'
    ],
    external: externalPackageNames,
    output: {
      file: 'tmp/automated-tests.js',
      globals: packageGlobals,
      exports: 'none',
      format: 'umd'
    },
    plugins: [
      resolve(), // for tslib
      sourcemaps(), // for processing tsc's sourcemaps
      multiEntry({
        exports: false // otherwise will complain about exported utils
      })
    ]
  }
}

function onwarn(warning, warn) {
  if (warning.code !== 'PLUGIN_WARNING') {
    // warn(warning)
  }
}
