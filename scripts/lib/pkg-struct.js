const path = require('path')
const { existsSync } = require('fs')
const { buildPkgJsonObj } = require('./pkg-json-obj')


let pkgStructs = buildPkgStructs()
let pkgStructHash = {}

for (let pkgStruct of pkgStructs) {
  pkgStructHash[pkgStruct.name] = pkgStruct
}

exports.pkgStructs = pkgStructs
exports.pkgStructHash = pkgStructHash
exports.getCorePkgStruct = getCorePkgStruct
exports.getNonPremiumBundle = getNonPremiumBundle


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
  let shortName = path.basename(dir)
  let isCore = shortName === 'core'
  let isBundle = shortName === 'bundle'
  let jsonPath = path.join(process.cwd(), dir, 'package.json')

  if (existsSync(jsonPath)) {
    let origJsonObj = require(jsonPath) // not yet combined with more root-level json
    let srcDir = path.join(dir, 'src') // relative to project root
    let tscDir = path.join('tmp/tsc-output', srcDir)

    return {
      name: pkgName,
      shortName,
      isCore,
      isBundle,
      isPremium,
      dir, // relative to project root
      srcDir,
      tscDir, // TODO: use elsewhere!!!
      tscMain: path.join(tscDir, path.basename(mainPath)), // TODO: use elsewhere!!! TODO: make an absolute version
      distDir: path.join(dir, 'dist'), // relative to project root
      jsonObj: buildPkgJsonObj(origJsonObj, isPremium, isBundle)
    }
  }
}


// TODO: stop making these funcs!!!

function getCorePkgStruct() {
  for (let pkgStruct of pkgStructs) {
    if (pkgStruct.isCore) {
      return pkgStruct
    }
  }

  throw new Error('No core package')
}


function getNonPremiumBundle() {
  let matches = pkgStructs.filter(
    (pkgStruct) => pkgStruct.isBundle && !pkgStruct.isPremium
  )

  if (!matches.length) {
    throw new Error('No non-premium bundle')
  }

  return matches[0]
}

