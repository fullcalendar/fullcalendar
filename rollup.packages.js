const path = require('path')
const globby = require('globby')
const nodeResolve = require('@rollup/plugin-node-resolve')
const dts = require('rollup-plugin-dts').default


const REL_REGEX = /^\./
const VDOM_SWITCH_REGEX = /\/vdom-switch$/
const MAIN_PATHS = [
  'packages?(-premium)/*/tsc/main.js',
  '!packages?(-premium)/bundle/tsc/main.js',
  '!packages?(-premium)/__tests__/tsc/main.js'
]


module.exports = [
  ...jsConfigs(),
  ...dtsConfigs()
]


function jsConfigs() {
  return globby.sync(MAIN_PATHS).map((mainPath) => {
    let packageName = getPackageName(mainPath)
    return {
      input: mainPath,
      output: {
        format: 'es',
        dir: path.resolve(mainPath, '../../dist')
      },
      plugins: [
        packageName === 'common'
          ? removeVDomSwitch()
          : externalizeVDom(),
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


function getPackageName(mainPath) {
  return mainPath.match(/^packages[^/]*\/([^/]*)/)[1]
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


function removeVDomSwitch() {
  return {
    resolveId(id) {
      if (VDOM_SWITCH_REGEX.test(id)) {
        return { id: 'packages/vdom-nothing.js' }
      }
    }
  }
}


function externalizeVDom() {
  return {
    resolveId(id) {
      if (/\/vdom$/.test(id) || id.match(/^(preact|react|react-dom)$/)) {
        return { id: './vdom', external: true }
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
