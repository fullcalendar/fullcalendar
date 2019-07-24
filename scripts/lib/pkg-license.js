const path = require('path')
const { copyFile } = require('./util')
const { pkgStructs } = require('./pkg-struct')


const NORMAL_LICENSE = 'LICENSE.txt'
const PREMIUM_LICENSE = 'packages-premium/LICENSE.md'


exports.writePkgLicenses = writePkgLicenses


function writePkgLicenses() {
  return Promise.all(
    pkgStructs.map(function(pkgStruct) {
      let srcPath = pkgStruct.isPremium ? PREMIUM_LICENSE : NORMAL_LICENSE
      let destPath = path.join(pkgStruct.distDir, path.basename(srcPath))

      return copyFile(srcPath, destPath)
    })
  )
}
