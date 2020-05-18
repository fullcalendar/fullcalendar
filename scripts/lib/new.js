const fs = require('fs')
const path = require('path')


exports.checkNoSymlinks = checkNoSymlinks
exports.removeExt = removeExt


function checkNoSymlinks(structs) {
  for (let struct of structs) {
    let js = path.join(struct.dir, struct.mainDistJs)
    let dts = path.join(struct.dir, struct.mainDistDts)

    let badFile =
      ((fs.existsSync(js) && fs.lstatSync(js).isSymbolicLink()) ? js : '') ||
      ((fs.existsSync(dts) && fs.lstatSync(dts).isSymbolicLink()) ? dts : '')

    if (badFile) {
      console.error(`Must clear symlink before doing rollup packages: ${badFile}`)
      process.exit(1)
    }
  }
}


function removeExt(path) {
  return path.replace(/\.[^.]*$/,'')
}
