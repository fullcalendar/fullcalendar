const path = require('path')
const nodeResolve = require('rollup-plugin-node-resolve')
const scss = require('rollup-plugin-scss')
const { renderBanner, isRelPath, SOURCEMAP_PLUGINS, WATCH_OPTIONS, EXTERNAL_BROWSER_GLOBALS, TEMPLATE_PLUGIN, stripScssTildeImporter, onwarn } = require('./rollup-util')
const { pkgStructs, pkgStructHash } = require('./pkg-struct')


module.exports = function(isDev) {
  let configs = []

  for (let pkgStruct of pkgStructs) {
    if (pkgStruct.isBundle) {
      let bundleConfig = buildBundleConfig(pkgStruct, isDev)
      let nonBundleNames = require(path.join(process.cwd(), pkgStruct.dir, 'non-bundled-plugins.json'))
      let nonBundleConfigs = nonBundleNames.map((name) => (
        buildNonBundleConfig(pkgStructHash[name], pkgStruct.distDir, isDev)
      ))

      configs.push(bundleConfig, ...nonBundleConfigs)
    }
  }

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
      name: EXTERNAL_BROWSER_GLOBALS['fullcalendar'],
      banner,
      sourcemap: isDev
    },
    plugins: [
      nodeResolve({
        customResolveOptions: {
          paths: [ nodeModulesDir ] // for requiring other packages
        }
      }),
      scss({
        includePaths: [ nodeModulesDir ], // for including scss in other packages
        importer: stripScssTildeImporter
      }),
      ...(isDev ? SOURCEMAP_PLUGINS : [])
    ],
    watch: WATCH_OPTIONS,
    onwarn
  }
}


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
      exports: 'named', // allows export of default AND named. the `default` keys will collide, but who cares
      globals: EXTERNAL_BROWSER_GLOBALS,
      banner,
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
