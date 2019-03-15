#!/usr/bin/env node

const path = require('path')
const shell = require('shelljs')
const tsConfig = require(path.resolve(__dirname, '../tsconfig.json'))
const packagePaths = tsConfig.compilerOptions.paths

let version = process.argv[2] // first arg starts at index 2
let productionStr = process.argv[3]
let npmRegistryStr

if (!version) {
  console.log('Must enter a version')
  process.exit(1)
}

if (!productionStr) {
  console.log('Will use DEV npm registry')
  npmRegistryStr = '--registry http://localhost:4873' // TODO: make dry. in publish-release.sh also
} else if (productionStr === '--production') {
  console.log('Will use PRODUCTION npm registry')
  npmRegistryStr = ''
} else {
  console.log('Invalid production flag')
  process.exit(1)
}

console.log('Deleting git tag...')
shell.exec('git tag -d v' + version)

console.log('Unpublishing from registry...')

for (let packageName in packagePaths) {
  let jsPath = packagePaths[packageName][0]

  if (jsPath.match(/^src\//)) { // one of our lib files
    shell.exec('npm unpublish ' + packageName + '@' + version + ' ' + npmRegistryStr)
  }
}
