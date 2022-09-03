const path = require('path')
const { removeExt } = require('./new')


exports.buildEntryMap = buildEntryMap
exports.buildAliasMap = buildAliasMap


function buildEntryMap(structs) {
  let entryMap = {}

  for (let struct of structs) {
    entryMap[removeExt(path.join(struct.dir, struct.mainDistJs))] = './' + path.join(struct.dir, struct.mainSrc)
  }

  return entryMap
}


function buildAliasMap(structs) {
  let aliasMap = {}

  for (let struct of structs) {
    aliasMap[struct.name + '$'] = path.resolve(__dirname, '../..', struct.dir, struct.mainSrc)
  }

  return aliasMap
}
