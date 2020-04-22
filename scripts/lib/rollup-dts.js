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
        resolveId(id, source) {
          if (isScssPath(id)) {
            return false
          }
          if (!isRelPath(id)) {
            return { id, external: true }
          }
          return null
        },
        renderChunk(code, chunk) {
          if (chunk.fileName === 'packages/core/dist/main.d.ts') {
            return fixCode(code)
          }
          return code
        }
      }
    ],
    // // uncomment to see all circular dependency warnings
    // onwarn(warning, warn) {
    //   console.log('WARNING', warning)
    //   warn(warning)
    // }
  }
}


// for a problem like this: https://github.com/Swatinem/rollup-plugin-dts/issues/39
function fixCode(code) {
  let replacements = {}

  code = code.replace(/import \{(.*?)\} from '@fullcalendar\/core';?/, function(m0, m1) {
    let matches = m1.matchAll(/(\w+) as (\w+\$\d+)/g)
    for (let match of matches) {
      replacements[match[2]] = match[1]
    }
    return ''
  })

  for (let find in replacements) {
    let replacement = replacements[find]
    find = find.replace('$', '\\$') // escape for regexp
    code = code.replace(new RegExp(find, 'g'), replacement)
  }

  return code
}
