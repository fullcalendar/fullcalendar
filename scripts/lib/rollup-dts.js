const dts = require('rollup-plugin-dts').default
const { isScssPath, isRelPath } = require('./rollup-util')
const { pkgStructs } = require('./pkg-struct')
const { mapHashViaPair } = require('./util')


module.exports = function() {
  return {
    input: mapHashViaPair(pkgStructs, (pkgStruct) => [
      pkgStruct.distDir, // the key. the [name] in entryFileNames
      './' + pkgStruct.tscMain + '.d.ts' // the value
    ]),
    output: {
      format: 'es',
      dir: '.',
      entryFileNames: '[name]/main.d.ts'
    },
    plugins: [
      dts(),
      {
        resolveId(id) {
          if (isScssPath(id)) {
            return false
          }
          if (!isRelPath(id)) {
            return { id, external: true }
          }
          return null
        }
      }
    ],
    //// uncomment to see all circular dependency warnings
    // onwarn(warning, warn) {
    //   console.log('WARNING', warning)
    //   warn(warning)
    // }
  }
}
