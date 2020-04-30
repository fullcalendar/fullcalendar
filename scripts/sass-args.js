#!/usr/bin/env node

const path = require('path')
const glob = require('glob')
const { pkgStructs } = require('./lib/pkg-struct')

let pairs = []

for (let pkgStruct of pkgStructs) {
  let srcDirAbs = path.join(process.cwd(), pkgStruct.srcDir) // TODO: dont rely on us being at root
  let dirAbs = path.join(process.cwd(), pkgStruct.dir)

  let scssFilesnames = glob.sync('*.scss', { // .scss files in the root
    cwd: srcDirAbs,
    ignore: '**/_*.scss' // ignore includes
  })

  // TODO: when this script runs sass ourselves, make paths relative

  for (let scssFilesname of scssFilesnames) {
    pairs.push(
      path.join(srcDirAbs, scssFilesname) +
      ':' +
      path.join(dirAbs, scssFilesname.replace('.scss', '.css')) // TODO: more robust replacement
    )
  }
}

console.log(pairs.join(' '))
