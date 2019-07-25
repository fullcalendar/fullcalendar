const path = require('path')


const BASE_JSON = 'package.json'
const PREMIUM_JSON = 'packages-premium/package.json'


exports.buildPkgJsonObj = buildPkgJsonObj


function buildPkgJsonObj(origJsonObj, isPremium) {
  let merged = Object.assign({}, getBaseJsonObj(isPremium))

  // things we don't want on inherit from the roots
  delete merged.dependencies
  delete merged.peerDependencies
  delete merged.optionalDependencies

  Object.assign(merged, origJsonObj)

  // things we don't want from either package.json
  delete merged.private
  delete merged.devDependencies
  delete merged.scripts
  delete merged.browserGlobal

  // additions
  merged.main = 'main.js'
  merged.module = 'main.esm.js'
  merged.unpkg = 'main.min.js'
  merged.types = 'main.d.ts'

  return merged
}


function getBaseJsonObj(isPremium) {
  let base = require(path.join(process.cwd(), BASE_JSON))

  // do lazily, in case the repo doesn't have any premium
  if (isPremium) {
    let premium = require(path.join(process.cwd(), PREMIUM_JSON))
    base = Object.assign({}, base, premium) // merge with existing base
  }

  return base
}
