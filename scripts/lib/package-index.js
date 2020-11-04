const path = require('path')
const globby = require('globby')
const fs = require('fs')


let configPaths = globby.sync([
  'packages?(-premium)/*/package.json'
])

let packageStructs = exports.packageStructs = configPaths.filter((path) => !isTest(path) && !isBundle(path)).map(buildStruct)
let bundleStructs = exports.bundleStructs = configPaths.filter((path) => isBundle(path)).map(buildStruct)
let testStructs = exports.testStructs = configPaths.filter((path) => isTest(path)).map(buildStruct)
exports.allStructs = packageStructs.concat(bundleStructs, testStructs)


exports.publicPackageStructs = packageStructs.filter((struct) => struct.name !== '@fullcalendar/core-preact') // not a good way to do this


function buildStruct(configPath) {
  let config = require('../../' + configPath)
  let dir = path.join(configPath, '..')
  let mainDistJs = config.module || config.main || 'index.js'
  let mainDistDts = config.types || 'index.d.ts'
  let mainName = path.basename(mainDistJs, '.js')
  let mainSrc = path.join('src', mainName + '.ts')
  let mainGlobalSrc = path.join('src', mainName + '.global.ts') // might not exist
  let mainTscJs = path.join('tsc', mainName + '.js')
  let mainGlobalTscJs = path.join('tsc', mainName + '.global.js') // might not exist
  let mainTscDts = path.join('tsc', mainName + '.d.ts')

  return {
    name: config.name,
    dir,
    isPremium: dir.match('packages-premium'), // TODO: better
    mainName,
    mainDistJs,
    mainDistDts,
    mainSrc,
    mainTscJs,
    mainGlobalTscJs: fs.existsSync(path.join(dir, mainGlobalSrc)) ? mainGlobalTscJs : mainTscJs,
    mainTscDts,
    meta: config
  }
}


function isTest(path) {
  return /[\\/]__tests__[\\/]/.test(path)
}


function isBundle(path) {
  return /[\\/]bundle[\\/]/.test(path)
}
