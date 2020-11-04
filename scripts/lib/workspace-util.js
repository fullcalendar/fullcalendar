const exec = require('./shell')


exports.getPkgNameToLocationHash = getPkgNameToLocationHash
exports.getPkgObjs = getPkgObjs


function getPkgNameToLocationHash() {
  let objs = getPkgObjs()
  let hash  = {}

  for (let obj of objs) {
    hash[obj.name] = obj.location
  }

  return hash
}


function getPkgObjs() {
  return exec.sync('yarn workspaces list --json')
    .stdout
    .trim()
    .split('\n')
    .map((str) => JSON.parse(str))
}
