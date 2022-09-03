const path = require('path')
const { publicPackageStructs, bundleStructs } = require('./lib/package-index')
const exec = require('./lib/shell').sync.withOptions({
  exitOnError: true,
  live: true
})

exec([ path.join(__dirname, 'require-clean-working-tree.sh') ])

let subjectStructs = publicPackageStructs.concat(bundleStructs)
let licenseDests = []

for (let struct of subjectStructs) {
  let licenseSrc = struct.isPremium
    ? path.join(__dirname, '../packages-premium/LICENSE.md')
    : path.join(__dirname, '../LICENSE.txt')
  let licenseDest = path.join(__dirname, '..', struct.dir, struct.isPremium ? 'LICENSE.md' : 'LICENSE.txt')

  console.log(licenseSrc, licenseDest)

  exec([ 'cp', '-f', licenseSrc, licenseDest ])
  licenseDests.push(licenseDest)
}

for (let licenseDest of licenseDests) {
  exec(
    [ 'git', 'add', path.basename(licenseDest) ],
    { cwd: path.dirname(licenseDest) } // will do it in whatever git repo
  )
}

exec([ 'git', 'commit', '-m', 'updated licenses' ], { cwd: path.join(__dirname, '../packages-premium') })
exec([ 'git', 'add', 'packages-premium' ], { cwd: path.join(__dirname, '..') })
exec([ 'git', 'commit', '-m', 'updated licenses' ], { cwd: path.join(__dirname, '..') })
