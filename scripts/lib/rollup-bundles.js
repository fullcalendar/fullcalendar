const path = require('path')
const glob = require('glob')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const postCss = require('rollup-plugin-postcss')
const { renderBanner, isRelPath, SOURCEMAP_PLUGINS, WATCH_OPTIONS, EXTERNAL_BROWSER_GLOBALS, TEMPLATE_PLUGIN, onwarn, isScssPath } = require('./rollup-util')
const { pkgStructs, pkgStructHash, getCorePkgStruct, getNonPremiumBundle } = require('./pkg-struct')
const alias = require('rollup-plugin-alias')
const replace = require('rollup-plugin-replace')
const react = require('react')
const reactDom = require('react-dom')


module.exports = function(isDev) {
  let configs = []

  for (let pkgStruct of pkgStructs) {
    if (pkgStruct.isBundle) {
      let bundleConfig = buildBundleConfig(pkgStruct, isDev)
      let nonBundleNames = require(path.join(process.cwd(), pkgStruct.dir, 'non-bundled-plugins.json'))
      let nonBundleConfigs = nonBundleNames.map((name) => (
        buildNonBundleConfig(pkgStructHash[name], pkgStruct.distDir, isDev)
      ))

      configs.push(
        bundleConfig,
        ...nonBundleConfigs
      )
    }
  }

  configs.push(
    ...buildLocaleConfigs(),
    buildLocalesAllConfig()
  )

  return configs
}


function buildBundleConfig(pkgStruct, isDev) {
  let banner = renderBanner(pkgStruct.jsonObj)

  return {
    input: path.join('tmp/tsc-output', pkgStruct.srcDir, 'main.js'), // TODO: use tscMain
    output: {
      format: 'umd',
      file: path.join(pkgStruct.distDir, 'main.js'),
      name: EXTERNAL_BROWSER_GLOBALS['fullcalendar'], // TODO: make it a separarate const???
      banner,
      sourcemap: isDev
    },
    plugins: [
      alias(buildAliasMap()),
      nodeResolve(), // for requiring tslib. TODO: whitelist?
      commonjs({
        // this react(-dom) hack is also in rollup-tests.js
        namedExports: {
          'react': Object.keys(react),
          'react-dom': Object.keys(reactDom)
        }
      }),
      replace({ // for react. also in rollup-tests.js
        values: {
          'process.env.NODE_ENV': '"production"'
        }
      }),
      postCss({
        extract: true // to separate file
      }),
      ...(isDev ? SOURCEMAP_PLUGINS : []),
      {
        resolveId(id, importer) { // TODO: not really DRY // TODO: use alias instead?
          if (isScssPath(id) && isRelPath(id) && importer.match('/tmp/tsc-output/')) {
            let resourcePath = importer.replace('/tmp/tsc-output/', '/')
            resourcePath = path.dirname(resourcePath) // the directory of the file
            resourcePath = resourcePath.replace(/\/src(\/|$)/, '/dist$1')
            resourcePath = path.join(resourcePath, id.replace('.scss', '.css'))
            return { id: resourcePath, external: false }
          }
          return null
        }
      },
    ],
    watch: WATCH_OPTIONS,
    onwarn
  }
}


/*
if the exports object has the globalPlugins property, that means the exports object
is the same as the root fullcalendar namespace, which means we're executing as browser globals.
in this case, register the plugin globally. also, undo attaching a useless `default` export.
*/
const OUTRO = `
if (exports.globalPlugins) {
  exports.globalPlugins.push(exports.default)
  delete exports.default
}
`

/*
modules we don't want in the main bundle file but want as separate files in the same dir.
can't have CSS.
*/
function buildNonBundleConfig(pkgStruct, bundleDistDir, isDev) {
  let banner = renderBanner(pkgStruct.jsonObj)
  let inputFile = path.join('tmp/tsc-output', pkgStruct.srcDir, 'main.js')

  return {
    input: inputFile,
    output: {
      format: 'umd',
      file: path.join(bundleDistDir, pkgStruct.shortName + '.js'),
      name: EXTERNAL_BROWSER_GLOBALS['fullcalendar'], // tack on to existing global
      extend: true, // don't overwrite whats already on the UMD global
      exports: 'named', // allows export of default AND named
      globals: EXTERNAL_BROWSER_GLOBALS, // because these pkgStructs are connectors to third party plugins, and we dont want to include 3rd party files!
      banner,
      outro: OUTRO,
      sourcemap: isDev
    },
    plugins: [
      // if we don't provide this whitelist, all external packages get resolved and included :(
      nodeResolve({ only: [ 'tslib' ] }),
      TEMPLATE_PLUGIN,
      ...(isDev ? SOURCEMAP_PLUGINS : []),
      {
        // use the resolvedId hook to rename the import of @fullcalendar/core -> fullcalendar.
        // otherwise, we could have used the exernals config option all the way.
        // nodeResolve seems to take precedence (thus the tslib hack). PUT THIS FIRST?s
        resolveId(id) {
          if (id === inputFile) { return inputFile }
          if (id === 'tslib') { return { id, external: false } }
          if (id === '@fullcalendar/core') { return { id: 'fullcalendar', external: true } } // TODO: shouldn't this be 'fullcalendar-scheduler' in some cases?
          if (!isRelPath(id)) { return { id, external: true } }
          return null
        }
      }
    ],
    watch: WATCH_OPTIONS,
    onwarn
  }
}


function buildLocaleConfigs() { // for EACH
  let corePkg = getCorePkgStruct()
  let bundleStruct = getNonPremiumBundle()
  let localePaths = glob.sync('locales/*.js', { cwd: corePkg.tscDir })

  return localePaths.map((localePath) => {
    let localeCode = path.basename(localePath).replace(/\.[^.]*$/, '')

    return {
      input: path.join(corePkg.tscDir, localePath),
      output: {
        format: 'umd',
        name: 'FullCalendarLocales.' + localeCode, // code isn't used, but needs to be unique
        file: path.join(bundleStruct.distDir, localePath)
      }
    }
  })
}


function buildLocalesAllConfig() {
  let corePkgStruct = getCorePkgStruct()
  let bundleStruct = getNonPremiumBundle()

  return {
    input: path.join(corePkgStruct.distDir, 'locales-all.js'),
    output: {
      format: 'umd',
      name: 'FullCalendarLocales',
      file: path.join(bundleStruct.distDir, 'locales-all.js'),
    },
    watch: WATCH_OPTIONS,
    onwarn
  }
}


// TODO: use elsewhere
// NOTE: can't use `entries` because rollup-plugin-alias is an old version
function buildAliasMap() {
  let map = {}

  for (let pkgStruct of pkgStructs) {
    if (!pkgStruct.isBundle) {
      map[pkgStruct.name] = path.join(process.cwd(), pkgStruct.tscMain) // needs to be absolute
    }
  }

  return map
}
