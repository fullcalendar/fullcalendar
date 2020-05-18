const path = require('path')


exports.externalizeStylesheets = externalizeStylesheets
exports.externalizeNonRelative = externalizeNonRelative
exports.externalizeRelative = externalizeRelative
exports.buildAliasMap = buildAliasMap


function externalizeStylesheets() {
  return {
    resolveId(id) {
      if (id.match(/\.(css|scss|sass)$/)) {
        return { id, external: true }
      }
    }
  }
}


function buildAliasMap(structs) {
  let aliasMap = {}

  for (let struct of structs) {
    aliasMap[struct.name] = path.join(struct.dir, struct.mainTscJs)
  }

  return aliasMap
}


function externalizeNonRelative() {
  return {
    resolveId(id, importer) {
      if (importer && !/^\./.test(id)) {
        return { id, external: true }
      }
    }
  }
}


function externalizeRelative() {
  return {
    resolveId(id, importer) {
      if (!importer && id.match(/^\.\//)) {
        return { id, external: true }
      }
    }
  }
}
