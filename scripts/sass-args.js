#!/usr/bin/env node

const path = require('path')
const globby = require('globby')

const ROOT = path.resolve(__dirname, '..')
const SRC_FILES = globby.sync([
  'packages?(-premium)/*/src/*.scss',
  '!**/_*.scss'
], { cwd: ROOT })

let pairs = SRC_FILES.map((srcFile) => {
  let pkgDir = path.resolve(srcFile, '../..')
  let destFile = path.join(pkgDir, 'dist', path.basename(srcFile, '.scss') + '.css')
  return srcFile + ':' + destFile
})

console.log(pairs.join(' '))
