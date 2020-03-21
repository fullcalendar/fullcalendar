const path = require('path')
const { readFileSync } = require('fs')
const nodeResolve = require('rollup-plugin-node-resolve')
// const sass = require('rollup-plugin-sass')
const scss = require('rollup-plugin-scss') // does correct ordering. BAD BUG: can't have SASS includes with same filename. FILE BUG
const { renderBanner, isRelPath, isScssPath, TEMPLATE_PLUGIN, SOURCEMAP_PLUGINS, WATCH_OPTIONS, onwarn, watchSubdirSassIncludes } = require('./rollup-util')
const { pkgStructs, getCorePkgStruct } = require('./pkg-struct')


module.exports = function(isDev) {
  return pkgStructs.filter((pkgStruct) => !pkgStruct.isBundle)
    .map((pkgStruct) => buildPkgConfig(pkgStruct, isDev))
}


const coreVarsScssString = readFileSync(
  path.join(getCorePkgStruct().srcDir, 'styles/_vars.scss'),
  'utf8'
)


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
      // sass({
      //   output: true, // to a .css file
      //   options: {
      //     // core already has sass vars imported, but inject them for other modules
      //     data: (pkgStruct.isCore ? '' : coreVarsScssString) + '\n'
      //   }
      // }),
      scss({
        output: true, // to a .css file
        prefix: (pkgStruct.isCore ? '' : coreVarsScssString) + '\n'
      }),
      TEMPLATE_PLUGIN,
      ...(isDev ? SOURCEMAP_PLUGINS : []),
      {
        resolveId(id) { // TODO: not DRY
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
