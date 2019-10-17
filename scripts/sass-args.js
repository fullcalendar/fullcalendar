#!/usr/bin/env node

const path = require('path')
const { existsSync } = require('fs')
const { pkgStructs } = require('./lib/pkg-struct')


let args = []

for (let pkgStruct of pkgStructs) {
  let srcPath = path.join(pkgStruct.srcDir, 'main.scss')
  let destPath = path.join(pkgStruct.distDir, 'main.css')

  if (existsSync(srcPath)) {
    args.push(srcPath + ':' + destPath)
  }
}

console.log(args.join(' '))
