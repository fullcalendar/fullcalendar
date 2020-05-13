const path = require('path')
const globby = require('globby')
const dts = require('rollup-plugin-dts').default


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
  return globby.sync(MAIN_PATHS).map((mainPath) => ({
    input: mainPath,
    output: {
      format: 'es',
      dir: path.resolve(mainPath, '../../dist')
    },
    plugins: [
      externalizeStylesheets(),
      externalizeNamed(mainPath)
    ],
    watch: {
      chokidar: { // better than default watch util. doesn't fire change events on stat changes (like last opened)
        awaitWriteFinish: { // because tsc/rollup sometimes takes a long time to write and triggers two recompiles
          stabilityThreshold: 500,
          pollInterval: 100
        }
      },
      clearScreen: false
    }
  }))
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
        !id.match(/^\./) // non-relative
      ) {
        return { id, external: true }
      }
    }
  }
}


function dtsConfigs() {
  return globby.sync(MAIN_PATHS).map((mainPath) => ({
    input: mainPath.replace(/\.js$/, '.d.ts'),
    output: {
      format: 'es',
      file: path.resolve(mainPath, '../../dist/main.d.ts')
    },
    plugins: [
      externalizeStylesheets(),
      externalizeVDom(),
      dts()
    ]
  }))
}


function externalizeVDom() { // TODO: will need to copy these over manually!!!
  return {
    resolveId(id) {
      if (id.match(/\/vdom$/)) {
        return { id, external: true }
      }
    }
  }
}
