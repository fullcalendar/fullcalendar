const path = require('path')
const { readFileSync } = require('fs')
const nodeResolve = require('rollup-plugin-node-resolve')
const { renderBanner, isRelPath, isScssPath, TEMPLATE_PLUGIN, SOURCEMAP_PLUGINS, WATCH_OPTIONS, onwarn } = require('./rollup-util')
const { pkgStructs, getCorePkgStruct } = require('./pkg-struct')


module.exports = function(isDev) {
  return pkgStructs.filter((pkgStruct) => !pkgStruct.isBundle)
    .map((pkgStruct) => buildPkgConfig(pkgStruct, isDev))
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
      return !isRelPath(id)
    },
    plugins: [
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
