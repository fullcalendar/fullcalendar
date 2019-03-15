#!/usr/bin/env node

const path = require('path')
const shell = require('shelljs')
const tsConfig = require(path.resolve(__dirname, '../tsconfig.json'))
const packagePaths = tsConfig.compilerOptions.paths
const publishScript = path.resolve(__dirname, 'publish-release.sh')

let version = process.argv[2] // first arg starts at index 2
let releaseTag = process.argv[3]
let productionStr = process.argv[4]

if (!version) {
  console.log('Must enter a version')
  process.exit(1)
}

if (!releaseTag) {
  console.log('Must enter a release tag')
  process.exit(1)
}

if (productionStr && productionStr !== '--production') {
  console.log('Invalid production flag')
  process.exit(1)
}

for (let packageName in packagePaths) {
  let jsPath = packagePaths[packageName][0]

  if (jsPath.match(/^src\//)) { // one of our lib files
    let srcPath = path.dirname(jsPath)
    let packageDirName = path.basename(srcPath) // :(

    shell.exec(publishScript + ' ' + [
      packageDirName, version, releaseTag, productionStr
    ].join(' '))
  }
}
