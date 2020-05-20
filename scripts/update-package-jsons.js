#!/usr/bin/env node

const path = require('path')
const { writeFileSync } = require('./lib/util')
const { publicPackageStructs } = require('./lib/package-index')
const exec = require('./lib/shell').sync.withOptions({
  exitOnError: true,
  live: true
})

const PROPS_TO_COPY = [
  'homepage',
  'bugs',
  'repository',
  'license',
  'author',
  'copyright'
]

exec([ path.join(__dirname, 'require-clean-working-tree.sh') ])

let mainConfig = require('../package.json')
let configPaths = []

for (let struct of publicPackageStructs) {
  let configPath = path.join(__dirname, '..', struct.dir, 'package.json')
  let config = require(configPath)

  for (let propName of PROPS_TO_COPY) {
    config[propName] = mainConfig[propName]
  }

  writeFileSync(configPath, JSON.stringify(config, null, '  ') + '\n')
  configPaths.push(configPath)
}

for (let configPath of configPaths) {
  exec(
    [ 'git', 'add', path.basename(configPath) ],
    { cwd: path.dirname(configPath) } // will do it in whatever git repo
  )
}

exec([ 'git', 'commit', '-m', 'updated package.jsons' ], { cwd: path.join(__dirname, '../packages-premium') })
exec([ 'git', 'add', 'packages-premium' ], { cwd: path.join(__dirname, '..') })
exec([ 'git', 'commit', '-m', 'updated package.jsons' ], { cwd: path.join(__dirname, '..') })
