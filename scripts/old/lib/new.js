const fs = require('fs')
const path = require('path')
const rootPkgConfig = require('../../package.json')
const premiumPkgConfig = require('../../packages-premium/package.json')


exports.checkNoSymlinks = checkNoSymlinks
exports.removeExt = removeExt
exports.buildBanner = buildBanner


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


// TODO: adapt this for each package
function buildBanner(isPremium) {
  let title = isPremium ? premiumPkgConfig.title : rootPkgConfig.title
  let homepage = isPremium ? premiumPkgConfig.homepage : rootPkgConfig.homepage
  let { version, copyright } = rootPkgConfig

  return `/*!
${title} v${version}
Docs & License: ${homepage}
(c) ${copyright}
*/`
}
