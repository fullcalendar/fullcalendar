const path = require('path')
const { readFileSync, writeFileSync } = require('./lib/util')
const { publicPackageStructs } = require('./lib/package-index')
const exec = require('./lib/shell').sync.withOptions({
  exitOnError: true,
  live: true
})

exec([ path.join(__dirname, 'require-clean-working-tree.sh') ])

const handlebars = require('handlebars')
let template = handlebars.compile(readFileSync(path.join(__dirname, '../packages/README.md.tpl')))
let readmePaths = []

for (let struct of publicPackageStructs) {
  let readmePath = path.join(__dirname, '..', struct.dir, 'README.md')
  let configPath = path.join(__dirname, '..', struct.dir, 'package.json')
  let config = require(configPath)
  let text = template(config)

  writeFileSync(readmePath, text)
  readmePaths.push(readmePath)
}

for (let readmePath of readmePaths) {
  exec(
    [ 'git', 'add', path.basename(readmePath) ],
    { cwd: path.dirname(readmePath) } // will do it in whatever git repo
  )
}

exec([ 'git', 'commit', '-m', 'updated readmes' ], { cwd: path.join(__dirname, '../packages-premium') })
exec([ 'git', 'add', 'packages-premium' ], { cwd: path.join(__dirname, '..') })
exec([ 'git', 'commit', '-m', 'updated readmes' ], { cwd: path.join(__dirname, '..') })
