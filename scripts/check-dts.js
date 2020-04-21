#!/usr/bin/env node

const path = require('path')
const glob = require('glob')

process.chdir(path.join(__dirname, '..')) // start in project root

let tmpDtsFiles = glob.sync('*.d.ts')

if (tmpDtsFiles.length) {
  console.error(
    'There are temp .d.ts files in the project root, which indicates that rollup-plugin-dts choked.\n' +
    'This happens when there is a circular dependency or a bad package import.'
  )
  process.exit(1)
}
