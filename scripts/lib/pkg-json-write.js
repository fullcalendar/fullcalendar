const path = require('path')
const { writeFile } = require('./util')
const { pkgStructs } = require('./pkg-struct')


exports.writePkgJsons = writePkgJsons


// NOTE: the content of jsonObj is generated in pkg-struct.js


function writePkgJsons() {
  return Promise.all(
    pkgStructs.map((pkgStruct) => {
      return writeFile(
        path.join(pkgStruct.distDir, 'package.json'),
        JSON.stringify(pkgStruct.jsonObj, null, '  ') + '\n'
      )
    })
  )
}
