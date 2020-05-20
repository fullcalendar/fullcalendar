const fs = require('fs')
const path = require('path')
const dts = require('rollup-plugin-dts').default
const sourceMapLoader = require('rollup-plugin-sourcemaps')
const postcss = require('rollup-plugin-postcss')
const { checkNoSymlinks, buildBanner } = require('./scripts/lib/new')
const { externalizeStylesheets, externalizeNonRelative, injectReleaseDate } = require('./scripts/lib/new-rollup')


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
        injectReleaseDate()
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
        fixDtsCodeIn(),
        externalizeVDom(),
        externalizeStylesheets(),
        externalizeNonRelative(),
        dts(),
        fixDtsCodeOut()
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


function fixDtsCodeIn() {
  return {
    /*
    fix problem with tsc outputting random imports like this:
      import("../../../packages/common/src/plugin-system-struct")
      import("../../../packages/common/src/main")
    */
    resolveId(id, importer) {
      if (importer && id.match('packages/common')) {
        return { id: '@fullcalendar/common', external: true }
      }
    }
  }
}


function fixDtsCodeOut() {
  return {
    renderChunk(code) {

      // remove sourcemap comments and ///<reference>
      code = code.replace(/\/\/.*/g, '')

      /*
      tsc, for classes that have superclasses with getter methods, sometimes reference the return type like this:
        import("@fullcalendar/common/tsc/whatever").Something
      and this is from WITHIN the @fullcalendar/common package
      */
      // BUG: playing weird with TS triple-slash references
      code = code.replace(/(['"]@fullcalendar\/[^'"]+)\/[^'"]+(['"])/g, function(m0, m1, m2) {
        return m1 + m2
      })

      // sometimes tsc fully resolved generic vdom declarations to preact, which makes the VNode<any> a thing (which it shouldn't be)
      code = code.replace(/VNode<any>/g, 'VNode')

      /*
      rollup-plugin-dts sometimes does not correctly reduce nested type declarations, leaving something like this:
        import("../toolbar-struct").ToolbarInput
      */
      code = code.replace(/import\(([^)]*)\)\./g, '')

      if (/\b(p?react)\b/.test(code)) {
        throw new Error('BAD reference to preact/react in DTS')
      }

      return code
    }
  }
}
