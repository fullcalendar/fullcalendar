const path = require('path')
const globby = require('globby')
const dts = require('rollup-plugin-dts').default


const REL_REGEX = /^\./
const VDOM_SWITCH_REGEX = /\/vdom-switch$/
const MAIN_PATHS = [ // TODO: use PKG_DIRS from gulp?
  'packages?(-premium)/*/tsc/main.js',
  '!packages?(-premium)/{core-vdom,bundle,__tests__}/tsc/main.js'
]


module.exports = [
  ...jsConfigs(),
  ...dtsConfigs()
]


function jsConfigs() {
  return globby.sync(MAIN_PATHS).map((mainPath) => {
    return {
      input: mainPath,
      output: {
        format: 'es',
        dir: path.resolve(mainPath, '../../dist')
      },
      plugins: [
        externalizeVDom(),
        externalizeStylesheets(),
        externalizeNamed(mainPath)
      ]
    }
  })
}


function dtsConfigs() {
  return globby.sync(MAIN_PATHS).map((mainPath) => {
    let dtsPath = mainPath.replace(/\.js$/, '.d.ts')
    return {
      input: dtsPath,
      output: {
        format: 'es',
        file: path.resolve(mainPath, '../../dist/main.d.ts')
      },
      plugins: [
        externalizeVDom(),
        externalizeStylesheets(),
        externalizeNamed(dtsPath),
        dts(),
        fixDtsCode()
      ]
    }
  })
}


function externalizeStylesheets() {
  return {
    resolveId(id) {
      if (id.match(/\.css$/)) {
        return { id, external: true }
      }
    }
  }
}


function externalizeNamed(mainPath) {
  return {
    resolveId(id) {
      if (
        id !== mainPath && // not the main file
        !REL_REGEX.test(id) && // non-relative
        !VDOM_SWITCH_REGEX.test(id)
      ) {
        return { id, external: true }
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

      /*
      dts, for classes that have superclasses with getter methods, sometimes reference the return type like this:
        import("@fullcalendar/common/tsc/whatever").Something
      */
      // BUG: playing weird with TS triple-slash references
      code = code.replace(/(['"]@fullcalendar\/[^\/]+)\/[^'"]+(['"])/g, function(m0, m1, m2) {
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
