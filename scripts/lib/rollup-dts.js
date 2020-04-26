const dts = require('rollup-plugin-dts').default
const { isScssPath, isNamedPkg } = require('./rollup-util')
const { pkgStructs } = require('./pkg-struct')
const { mapHashViaPair, copyFile } = require('./util')


// rollup-plugin-dts can't handle either of these
copyFile( // promise :(
  'tmp/tsc-output/packages/preact/src/vdom.d.ts',
  'packages/preact/dist/vdom.d.ts'
)
copyFile( // promise :(
  'tmp/tsc-output/packages/core/src/vdom.d.ts',
  'packages/core/dist/vdom.d.ts'
)


let hash = mapHashViaPair(pkgStructs, (pkgStruct) => [
  pkgStruct.distDir, // the key. the [name] in entryFileNames
  './' + pkgStruct.tscMain + '.d.ts' // the value
])

module.exports = function() {
  return {
    input: hash,
    output: {
      format: 'es',
      dir: '.',
      entryFileNames: '[name]/main.d.ts'
    },
    plugins: [
      {
        resolveId(id) { // not DRY
          if (id.match(/vdom$/)) {
            return { id: './vdom', external: true }
          }
        }
      },
      dts(),
      {
        resolveId(id, source) {
          if (isScssPath(id)) {
            return false
          }
          if (isNamedPkg(id)) {
            return { id, external: true }
          }
          return null
        },
        renderChunk(code, chunk) {
          if (chunk.fileName === 'packages/core/dist/main.d.ts') {
            code = fixCode(code)
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
    let re = /(\w+) as (\w+\$\d+)/g
    let match

    while ((match = re.exec(m1))) {
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
