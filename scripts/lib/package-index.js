const path = require('path')
const globby = require('globby')


let configPaths = globby.sync([
  'packages?(-premium)/*/package.json'
])

let packageStructs = exports.packageStructs = configPaths.filter((path) => !isTest(path) && !isBundle(path)).map(buildStruct)
let bundleStructs = exports.bundleStructs = configPaths.filter((path) => isBundle(path)).map(buildStruct)
let testStructs = exports.testStructs = configPaths.filter((path) => isTest(path)).map(buildStruct)
exports.allStructs = packageStructs.concat(bundleStructs, testStructs)


exports.publicPackageStructs = packageStructs.filter((struct) => struct.name !== '@fullcalendar/core-vdom') // not a good way to do this


function buildStruct(configPath) {
  let config = require('../../' + configPath)
  let dir = path.join(configPath, '..')
  let mainDistJs = config.module || config.main || 'index.js'
  let mainDistDts = config.types || 'index.d.ts'
  let mainName = path.basename(mainDistJs, '.js')
  let mainSrc = path.join('src', mainName + '.ts')
  let mainTscJs = path.join('tsc', mainName + '.js')
  let mainTscDts = path.join('tsc', mainName + '.d.ts')

  return {
    name: config.name,
    dir,
    mainName,
    mainDistJs,
    mainDistDts,
    mainSrc,
    mainTscJs,
    mainTscDts
  }
}


function isTest(path) {
  return /[\\/]__tests__[\\/]/.test(path)
}


function isBundle(path) {
  return /[\\/]bundle[\\/]/.test(path)
}
