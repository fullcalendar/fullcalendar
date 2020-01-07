const path = require('path')
const nodeResolve = require('rollup-plugin-node-resolve')
const { renderBanner, isRelPath, isScssPath, TEMPLATE_PLUGIN, SOURCEMAP_PLUGINS, WATCH_OPTIONS, onwarn } = require('./rollup-util')
const { pkgStructs } = require('./pkg-struct')


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
      return !isRelPath(id) || isScssPath(id)
    },
    plugins: [
      nodeResolve(),
      TEMPLATE_PLUGIN,
      ...(isDev ? SOURCEMAP_PLUGINS : [])
    ],
    watch: WATCH_OPTIONS,
    onwarn
  }
}
