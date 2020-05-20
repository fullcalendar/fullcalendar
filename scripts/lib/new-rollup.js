const path = require('path')
const replace = require('@rollup/plugin-replace')


exports.externalizeStylesheets = externalizeStylesheets
exports.externalizeNonRelative = externalizeNonRelative
exports.externalizeRelative = externalizeRelative
exports.buildAliasMap = buildAliasMap
exports.injectReleaseDate = injectReleaseDate
exports.removeStylesheetImports = removeStylesheetImports


function externalizeStylesheets() {
  return {
    resolveId(id) {
      if (id.match(/\.(css|scss|sass)$/)) {
        return { id, external: true }
      }
    }
  }
}


function removeStylesheetImports() {
  return {
    resolveId(id) {
      if (id.match(/\.(css|scss|sass)$/)) { // TODO: more DRY
        return { id: '', external: true }
      }
    }
  }
}


// for going to SRC
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


function injectReleaseDate() {
  return replace({
    delimiters: [ '<%= ', ' %>' ],
    values: {
      releaseDate: new Date().toISOString().replace(/T.*/, '') // just YYYY-MM-DD
    }
  })
}
