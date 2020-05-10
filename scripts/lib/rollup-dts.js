const path = require('path')
const dts = require('rollup-plugin-dts').default
const { isScssPath, isNamedPkg, isRelPath } = require('./rollup-util')
const { pkgStructs, pkgStructHash } = require('./pkg-struct')
const { arrayToHash, copyFile } = require('./util')



// TODO: wait for tsc to finish!
// rollup-plugin-dts can't handle either of these
copyFile( // promise :(
  'tmp/tsc-output/packages/core/src/vdom-preact.d.ts', // notice the difference :|
  'packages/core/vdom.d.ts'
)
copyFile( // promise :(
  'tmp/tsc-output/packages/common/src/vdom.d.ts',
  'packages/common/vdom.d.ts'
)


let hash = arrayToHash(pkgStructs, (pkgStruct) => [
  pkgStruct.dir, // the key. the [name] in entryFileNames
  './' + pkgStruct.tscMain + '.d.ts' // the value
])

let ROOT_DIR = process.cwd()


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
        resolveId(id, source) {
          // vdom is in a separate file.
          // also, (p)react gets imported because tsc traces ambient declaration to (p)react package. reference from vdom module.
          if (id.match(/vdom$/) || id.match(/^p?react$/)) {
            return { id: './vdom', external: true, moduleSideEffects: true }
          }

          // sometimes tsc writes .d.ts files weird when there are implicit imports. imports from the publicly-named root of own package.
          let pkgStruct = pkgStructHash[id]
          if (pkgStruct && source.indexOf(path.join(ROOT_DIR, pkgStruct.tscDir, '/')) === 0) {
            return path.join(ROOT_DIR, pkgStruct.tscMain + '.ts')
          }
        }
      },
      dts(), // we we combine the before/after resolveId?
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
        renderChunk(code) {
          // HACK. TODO: file bug
          // for weird non-transformed import() statements in dts file
          return code.replace(/import\(([^)]*)\)\./g, function(m0, m1) {
            let importStr = JSON.parse(m1) // parse the quoted string
            if (
              isRelPath(importStr) ||
              importStr === '@fullcalendar/common'
            ) {
              return ''
            } else {
              throw new Error(`Unknown import('${importStr}') for hack. Could not massage.`)
            }
          })
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
