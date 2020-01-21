const path = require('path')
const glob = require('glob')
const nodeResolve = require('rollup-plugin-node-resolve')
const postCss = require('rollup-plugin-postcss')
const { renderBanner, isRelPath, SOURCEMAP_PLUGINS, WATCH_OPTIONS, EXTERNAL_BROWSER_GLOBALS, TEMPLATE_PLUGIN, onwarn, watchSubdirSassIncludes } = require('./rollup-util')
const { pkgStructs, pkgStructHash, getCorePkgStruct, getNonPremiumBundle } = require('./pkg-struct')


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
  let nodeModulesDir = path.join(pkgStruct.dir, 'node_modules')
  let banner = renderBanner(pkgStruct.jsonObj)

  return {
    input: path.join('tmp/tsc-output', pkgStruct.srcDir, 'main.js'),
    output: {
      format: 'umd',
      file: path.join(pkgStruct.distDir, 'main.js'),
      name: EXTERNAL_BROWSER_GLOBALS['fullcalendar'], // TODO: make it a separarate const???
      banner,
      sourcemap: isDev
    },
    plugins: [
      watchSubdirSassIncludes,
      nodeResolve({
        customResolveOptions: {
          paths: [ nodeModulesDir ] // for requiring other packages
        }
      }),
      postCss({
        extract: true // to separate .css file
      }),
      ...(isDev ? SOURCEMAP_PLUGINS : [])
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
      globals: EXTERNAL_BROWSER_GLOBALS,
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
          if (id === '@fullcalendar/core') { return { id: 'fullcalendar', external: true } }
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
