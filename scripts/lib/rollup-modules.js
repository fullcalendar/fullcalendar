const path = require('path')
const nodeResolve = require('rollup-plugin-node-resolve')
const { renderBanner, isRelPath, isNamedPkg, isScssPath, TEMPLATE_PLUGIN, SOURCEMAP_PLUGINS, WATCH_OPTIONS, onwarn } = require('./rollup-util')
const { pkgStructs } = require('./pkg-struct')
const { copyFile } = require('./util')


module.exports = function(isDev) {
  let configs = pkgStructs.filter((pkgStruct) => !pkgStruct.isBundle)
    .map((pkgStruct) => buildPkgConfig(pkgStruct, isDev))

  // needed to have this in separate file because rollup wasn't understanding that it has side effects and needed to go before the @fullcalendar/core import
  // added bonuses:
  // - the import statement doesn't import any vars, which will maybe hint to the build env that there are side effects
  // - rollup-plugin-dts needed to handle the .d.ts files separately anyway
  configs.push({
    input: 'tmp/tsc-output/packages/core/src/vdom.js',
    output: {
      file: 'packages/core/dist/vdom.js',
      format: 'esm',
      sourcemap: isDev
    },
    external(id) {
      return isNamedPkg(id)
    }
  })

  return configs
}


function buildPkgConfig(pkgStruct, isDev) {
  let banner = renderBanner(pkgStruct.jsonObj)

  return {
    input: path.join('tmp/tsc-output', pkgStruct.srcDir, 'main.js'),
    output: {
      file: path.join(pkgStruct.distDir, 'main.js'),
      format: 'esm',
      banner,
      sourcemap: isDev
    },
    external(id) {
      return isNamedPkg(id)
    },
    plugins: [
      {
        resolveId(id, source) {
          if (id.match(/vdom$/) && source.match('packages/core')) {
            return { id, external: true }
          }
        }
      },
      nodeResolve(),
      TEMPLATE_PLUGIN,
      ...(isDev ? SOURCEMAP_PLUGINS : []),
      {
        resolveId(id) {
          if (isScssPath(id) && isRelPath(id)) {
            return { id: './' + path.basename(id, '.scss') + '.css', external: true }
          }
          return null
        }
      }
    ],
    watch: WATCH_OPTIONS,
    onwarn
  }
}
