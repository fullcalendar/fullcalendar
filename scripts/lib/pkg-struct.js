const path = require('path')
const { existsSync } = require('fs')
const { buildPkgJsonObj } = require('./pkg-json-obj')


exports.pkgStructs = buildPkgStructs()


function buildPkgStructs() {
  let tsConfig = require(path.join(process.cwd(), 'tsconfig.json'))
  let tsPaths = tsConfig.compilerOptions.paths
  let structs = []

  for (let entry in tsPaths) {
    let path = tsPaths[entry][0]

    if (path && path.match(/\/main$/)) {
      let struct = buildPkgStruct(entry, path)

      if (struct) {
        structs.push(struct)
      }
    }
  }

  return structs
}


function buildPkgStruct(pkgName, mainPath) {
  let isPremium = mainPath.indexOf('packages-premium/') !== -1
  let dir = path.dirname(path.dirname(mainPath))
  let jsonPath = path.join(process.cwd(), dir, 'package.json')

  if (existsSync(jsonPath)) {
    let origJsonObj = require(jsonPath) // not yet combined with more root-level json
    let browserGlobal = origJsonObj.browserGlobal

    if (!browserGlobal) {
      throw new Error('Must specify browserGlobal in', jsonPath)

    } else {
      return {
        name: pkgName,
        isPremium,
        dir, // relative to project root
        srcDir: path.join(dir, 'src'), // relative to project root
        distDir: path.join(dir, 'dist'), // relative to project root
        jsonObj: buildPkgJsonObj(origJsonObj, isPremium),
        browserGlobal
      }
    }
  }
}
