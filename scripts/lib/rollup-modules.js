const path = require('path')
const nodeResolve = require('rollup-plugin-node-resolve')
const sass = require('rollup-plugin-sass')
const { renderBanner, isRelPath, isScssPath, TEMPLATE_PLUGIN, SOURCEMAP_PLUGINS, WATCH_OPTIONS, onwarn, watchSubdirSassIncludes } = require('./rollup-util')
const { pkgStructs } = require('./pkg-struct')


module.exports = function(isDev) {
  return pkgStructs.filter((pkgStruct) => !pkgStruct.isBundle)
    .map((pkgStruct) => buildPkgConfig(pkgStruct, isDev))
}


function buildPkgConfig(pkgStruct, isDev) {
  let banner = renderBanner(pkgStruct.jsonObj)
  let anyCss = false

  return {
    input: path.join('tmp/tsc-output', pkgStruct.srcDir, 'main.js'),
    output: {
      file: path.join(pkgStruct.distDir, 'main.js'),
      format: 'esm',
      banner,
      sourcemap: isDev,
      intro() {
        if (anyCss) {
          return 'import \'./main.css\';'
        }
        return ''
      }
    },
    external(id) {
      return !isRelPath(id)
    },
    plugins: [
      watchSubdirSassIncludes,
      nodeResolve(),
      sass({
        output: true, // to a .css file
      }),
      TEMPLATE_PLUGIN,
      ...(isDev ? SOURCEMAP_PLUGINS : []),
      {
        resolveId(id) {
          if (isScssPath(id) && isRelPath(id)) {
            anyCss = true
            return { id: path.join(process.cwd(), pkgStruct.srcDir, id), external: false }
          }
          return null
        }
      }
    ],
    watch: WATCH_OPTIONS,
    onwarn
  }
}
