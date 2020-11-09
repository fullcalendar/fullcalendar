const { eslint } = require('../gulpfile')
const path = require('path')
const { publicPackageStructs } = require('./lib/package-index')
const exec = require('./lib/shell')


exports.eslintDir = eslintDir
exports.eslintAll = eslintAll


function eslintDir(dir) {
  let cmd = [
    'eslint',
    '--config', '.eslintrc.yml',
    '--ext', '.ts,.tsx,.js,.jsx',
    '--parser-options', JSON.stringify({
      project: path.join(dir, 'tsconfig.json')
    }),
    path.join(dir, 'src')
  ]

  let { success } = exec.sync(cmd, { live: true })
  return success
}


function getAllDirs() {
  return publicPackageStructs.map((struct) => struct.dir)
}


function eslintAll() {
  let dirs = process.argv.splice(2)
  let anyErrors = false

  if (!dirs.length || dirs[0] === 'all') {
    dirs = getAllDirs()
  }

  for (let dir of dirs) {
    if (!eslintDir(dir)) {
      anyErrors = true
    }
  }

  return anyErrors
}


if (require.main === module) {
  eslintAll()
}
