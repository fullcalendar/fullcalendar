const fs = require('fs')
const path = require('path')
const dts = require('rollup-plugin-dts').default
const sourceMapLoader = require('rollup-plugin-sourcemaps')
const postcss = require('rollup-plugin-postcss')
const { checkNoSymlinks, buildBanner } = require('./scripts/lib/new')
const { externalizeStylesheets, externalizeNonRelative } = require('./scripts/lib/new-rollup')

/*
needs tsc to run first
but needs symlinks killed also

compiles from TSC files
*/

const { publicPackageStructs } = require('./scripts/lib/package-index')
checkNoSymlinks(publicPackageStructs)

module.exports = [

  // for JS
  ...publicPackageStructs.map((struct) => {
    return {
      input: path.join(struct.dir, struct.mainTscJs),
      output: {
        format: 'es',
        file: path.join(struct.dir, struct.mainDistJs),
        sourcemap: true,
        banner: buildBanner()
      },
      plugins: [
        externalizeVDom(),
        externalizeNonRelative(),
        sourceMapLoader(), // load from transpiled-via-tsc JS files
        postcss({ // will use postcss.config.js
          extract: true
        }),
        transplantCss(struct.mainName),
      ]
    }
  }),

  // for DTS
  ...publicPackageStructs.map((struct) => {
    return {
      input: path.join(struct.dir, struct.mainTscDts),
      output: {
        format: 'es',
        file: path.join(struct.dir, struct.mainDistDts),
      },
      plugins: [
        externalizeVDom(),
        externalizeStylesheets(),
        externalizeNonRelative(),
        dts(),
        fixDtsCode()
      ]
    }
  })

]


function transplantCss(fileName) { // fileName w/o extension
  let hasCss = false

  return         {
    resolveId(id, importer) {
      if (/^\./.test(id) && /\.css$/.test(id)) { // relative stylesheet
        hasCss = true
        let filePath = path.join(importer, '..', id)
        filePath = filePath.replace('/tsc/', '/src/') // not very robust!!!
        return filePath
      }
    },
    intro() {
      if (hasCss) {
        return `import './${fileName}.css';`
      } else {
        return ''
      }
    }
  }
}


function externalizeVDom() {
  return {
    resolveId(id) {
      if (/\/vdom$/.test(id) || id.match(/^(preact|react|react-dom)$/)) {
        return { id: './vdom', external: true, moduleSideEffects: true }
      }
    }
  }
}


function fixDtsCode() {
  return {
    renderChunk(code) {

      // remove sourcemap comments and ///<reference>
      code = code.replace(/\/\/.*/g, '')

      /*
      dts, for classes that have superclasses with getter methods, sometimes reference the return type like this:
        import("@fullcalendar/common/tsc/whatever").Something
      */
      // BUG: playing weird with TS triple-slash references
      code = code.replace(/(['"]@fullcalendar\/[^'"]+)\/[^'"]+(['"])/g, function(m0, m1, m2) {
        return m1 + m2
      })

      /*
      rollup-plugin-dts sometimes does not correctly reduce nested type declarations, leaving something like this:
        import("../toolbar-struct").ToolbarInput
      */
      code = code.replace(/import\(([^)]*)\)\./g, '')

      return code
    }
  }
}
