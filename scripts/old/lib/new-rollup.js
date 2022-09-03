const path = require('path')
const replace = require('@rollup/plugin-replace')
const rootPkgMeta = require('../../package.json')


exports.rerootStylesheets = rerootStylesheets
exports.externalizeStylesheets = externalizeStylesheets
exports.externalizeNonRelative = externalizeNonRelative
exports.externalizeRelative = externalizeRelative
exports.buildAliasMap = buildAliasMap
exports.injectReleaseDateAndVersion = injectReleaseDateAndVersion


function rerootStylesheets(fileName) { // fileName w/o extension
  let hasCss = false

  return         {
    resolveId(id, importer) {
      if (/^\./.test(id) && /\.css$/.test(id)) { // relative stylesheet
        hasCss = true
        let filePath = path.join(importer, '..', id)
        filePath = filePath.replace('/tsc/', '/src/')
        return filePath
      }
    },
  }
}


function externalizeStylesheets() {
  return {
    resolveId(id) {
      if (id.match(/\.(css|scss|sass)$/)) {
        return { id, external: true }
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


function externalizeNonRelative(except) {
  return {
    resolveId(id, importer) {
      if (
        importer &&
        !/^\./.test(id) &&
        !id.match('style-inject') &&
        (!except || id !== except)
      ) {
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


function injectReleaseDateAndVersion() {
  return replace({
    delimiters: [ '<%= ', ' %>' ],
    preventAssignment: true,
    values: {
      releaseDate: new Date().toISOString().replace(/T.*/, ''), // just YYYY-MM-DD
      version: rootPkgMeta.version
    }
  })
}
