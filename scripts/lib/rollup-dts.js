const dts = require('rollup-plugin-dts').default
const { isScssPath } = require('./rollup-util')
const { pkgStructs } = require('./pkg-struct')
const { mapHashViaPair } = require('./util')

module.exports = function() {
  return {
    input: mapHashViaPair(pkgStructs, (pkgStruct) => [
      pkgStruct.distDir, // the key. the [name] in entryFileNames
      pkgStruct.tscMain + '.d.ts' // the value
    ]),
    output: {
      format: 'es',
      dir: '.',
      entryFileNames: '[name]/main.d.ts'
    },
    plugins: [
      dts(),
      {
        resolveId(source) {
          if (isScssPath(source)) {
            return false
          }
          return null
        }
      }
    ]
  }
}
