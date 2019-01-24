#!/usr/bin/env node

const path = require('path')
const tsConfig = require(path.resolve(__dirname, '../tsconfig.json'))

let packagePaths = tsConfig.compilerOptions.paths
let parts = []

for (let packageName in packagePaths) {
  let jsPath = packagePaths[packageName][0]

  if (jsPath.match(/^src\//)) { // one of our lib files
    let srcPath = path.dirname(jsPath)
    let distPath = 'dist/' + path.basename(srcPath) // :(

    parts.push(srcPath + ':' + distPath)
  }
}

console.log(parts.join(' '))
