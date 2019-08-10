const path = require('path')
const { readFileSync } = require('fs')
const glob = require('glob')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const multiEntry = require('rollup-plugin-multi-entry')
const sourcemaps = require('rollup-plugin-sourcemaps')
const alias = require('rollup-plugin-alias')
const replace = require('rollup-plugin-replace')
const cleanup = require('rollup-plugin-cleanup')
const handleBars = require('handlebars')
const { pkgStructs } = require('./scripts/lib/pkg-struct')
const rootPkgJsonData = require('./package.json')


const EXTERNAL_BROWSER_GLOBALS = {
  luxon: 'luxon',
  rrule: 'rrule',
  moment: 'moment'
}

const EXTERNAL_BROWSER_GLOBAL_HACKS = {
  'moment-timezone/builds/moment-timezone-with-data': 'moment' // see moment-timezone/src/main.ts
}

const WATCH_OPTIONS = {
  chokidar: { // better than default watch util. doesn't fire change events on stat changes (like last opened)
    awaitWriteFinish: { // because tsc/rollup sometimes takes a long time to write and triggers two recompiles
      stabilityThreshold: 500,
      pollInterval: 100
    }
  },
  clearScreen: false // let tsc do the screan clearing
}

const renderBanner = handleBars.compile(
  readFileSync('packages/banner.tpl', { encoding: 'utf8' })
)


module.exports = buildConfigs()


function buildConfigs() {
  let isDev = detectIsDev()
  let ownBrowserGlobals = {}

  for (let pkgStruct of pkgStructs) {
    ownBrowserGlobals[pkgStruct.name] = pkgStruct.browserGlobal
  }

  return [
    ...buildPkgConfigs(ownBrowserGlobals, isDev),
    ...buildLocaleConfigs(ownBrowserGlobals),
    buildTestConfig() // must be last b/c depends on built pkgs+locales
  ]
}


// FullCalendar Packages
// ----------------------------------------------------------------------------------------------------


function buildPkgConfigs(ownBrowserGlobals, isDev) {
  return pkgStructs.map((pkgStruct) => buildPkgConfig(pkgStruct, ownBrowserGlobals, isDev))
}


function buildPkgConfig(pkgStruct, ownBrowserGlobals, isDev) {
  let banner = renderBanner(pkgStruct.jsonObj)

  let external = Object.keys(Object.assign(
    {},
    EXTERNAL_BROWSER_GLOBAL_HACKS, // apply to all because didn't have per-pkg data from package.json's
    ownBrowserGlobals,
    pkgStruct.jsonObj.dependencies || {},
    pkgStruct.jsonObj.peerDependencies || {}
  ))

  let plugins = [
    nodeResolve({
      only: [ 'tslib' ] // the only external module we want to bundle
    }),
    replace({
      delimiters: [ '<%= ', ' %>' ],
      values: {
        version: rootPkgJsonData.version,
        releaseDate: new Date().toISOString().replace(/T.*/, '')
        // ^TODO: store this in package.json for easier old-release recreation
      }
    })
  ]

  if (isDev) {
    plugins.push(sourcemaps())

    // HACK: there's a bug with sourcemap reading and watching: the first rebuild includes the intermediate
    // sourceMappingURL comments, confusing consumers of the generated sourcemap. Forcefully remove these comments.
    plugins.push(cleanup({ comments: 'none' }))
  }

  return {
    onwarn,
    watch: WATCH_OPTIONS,
    input: path.join('tmp/tsc-output', pkgStruct.srcDir, 'main.js'),
    external,
    output: [
      {
        file: path.join(pkgStruct.distDir, 'main.js'),
        format: 'umd',
        name: pkgStruct.browserGlobal,
        globals: {
          ...ownBrowserGlobals,
          ...EXTERNAL_BROWSER_GLOBALS,
          ...EXTERNAL_BROWSER_GLOBAL_HACKS
        },
        exports: 'named',
        sourcemap: isDev,
        banner
      },
      {
        file: path.join(pkgStruct.distDir, 'main.esm.js'),
        format: 'esm',
        sourcemap: isDev,
        banner
      }
    ],
    plugins
  }
}


// Locales
// ----------------------------------------------------------------------------------------------------


function buildLocaleConfigs(ownBrowserGlobals) {
  let corePkgStruct = getCorePkgStruct()
  let coreTmpDir = path.join('tmp/tsc-output', corePkgStruct.srcDir)
  let localePaths = glob.sync('locales/*.js', { cwd: coreTmpDir })
  let external = Object.keys(ownBrowserGlobals)
  let configs = []

  for (let localePath of localePaths) {
    let localeName = path.basename(localePath).replace(/\..*$/, '')

    configs.push({
      onwarn,
      watch: WATCH_OPTIONS,
      input: path.join(coreTmpDir, localePath),
      external,
      output: {
        file: path.join(corePkgStruct.distDir, localePath),
        globals: ownBrowserGlobals,
        name: 'FullCalendarLocales.' + localeName,
        format: 'umd'
      }
    })
  }

  // ALL locales in one file
  configs.push({
    onwarn,
    watch: WATCH_OPTIONS,
    input: localePaths.map(localePath => path.join(coreTmpDir, localePath)),
    external,
    output: {
      file: path.join(corePkgStruct.distDir, 'locales-all.js'),
      globals: ownBrowserGlobals,
      name: 'FullCalendarLocalesAll',
      format: 'umd'
    },
    plugins: [
      multiEntry({ exports: 'array' })
    ]
  })

  return configs
}


// Tests
// ----------------------------------------------------------------------------------------------------


function buildTestConfig() {

  let plugins = [
    multiEntry({
      exports: false // don't combine all the exports. no need, and would collide
    }),
    nodeResolve({
      customResolveOptions: {
        // tests can access all the dependencies they declared. these deps will be bundled.
        // apparently this setting is inefficient.
        // IMPORTANT: our internal package.jsons need to be written first
        paths: [
          'packages/__tests__/node_modules',
          'packages-premium/__tests__/node_modules'
        ]
      }
    }),
    alias({
      // the alias to the non-premium tests. must be absolute
      'package-tests': path.join(process.cwd(), 'tmp/tsc-output/packages/__tests__/src')
    }),
    commonjs(), // for fast-deep-equal import
    sourcemaps()
  ]

  return {
    onwarn,
    watch: WATCH_OPTIONS,
    input: [
      'tmp/tsc-output/packages?(-premium)/__tests__/src/globals.js',
      'tmp/tsc-output/packages?(-premium)/__tests__/src/**/*.js'
    ],
    external: [
      // HACK: because hoisting is no yet implemented for the monorepo-tool, when we require our packages,
      // *their* dependencies are not deduped, we we get multiple instances of the below libraries in the bundle.
      // Until hoisting is implemented, make these external and include them manually from karma.config.js.
      'luxon',
      'rrule',
      'moment',
      'moment/locale/es',
      'moment-timezone/builds/moment-timezone-with-data'
    ],
    output: {
      file: 'tmp/tests.js',
      globals: Object.assign({}, EXTERNAL_BROWSER_GLOBALS, EXTERNAL_BROWSER_GLOBAL_HACKS), // HACK (continued)
      format: 'iife',
      sourcemap: true
    },
    plugins
  }
}


// Utils
// ----------------------------------------------------------------------------------------------------


function getCorePkgStruct() {
  for (let pkgStruct of pkgStructs) {
    if (pkgStruct.name === '@fullcalendar/core') {
      return pkgStruct
    }
  }

  throw new Error('No core package')
}


function onwarn(warning, warn) {
  // ignore circ dep warnings. too numerous and hard to fix right now
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    warn(warning)
  }
}


function detectIsDev() {
  if (!/^(development|production)$/.test(process.env.BUILD)) {
    console.warn('BUILD environment not specified. Assuming \'development\'')
    return true
  } else {
    return process.env.BUILD === 'development'
  }
}
