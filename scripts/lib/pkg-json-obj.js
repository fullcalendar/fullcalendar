const path = require('path')


const BASE_JSON = 'package.json'
const PREMIUM_JSON = 'packages-premium/package.json'


exports.buildPkgJsonObj = buildPkgJsonObj


function buildPkgJsonObj(origJsonObj, isPremium, isBundle) {
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

  // additions...

  if (isBundle) {
    merged.main = 'main.js' // will be umd
    merged.unpkg = 'main.min.js'
  } else {
    merged.main = 'main.js' // will be an ES module even tho using `main` not `module`
    merged.types = 'main.d.ts' // TODO: make work for bundle
  }

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
