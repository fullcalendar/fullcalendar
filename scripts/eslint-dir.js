const path = require('path')
const { packageStructs, testStructs } = require('./lib/package-index')
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
    // '--fix',
    path.join(dir, 'src')
  ]

  console.log(cmd.join(' '))

  let { success } = exec.sync(cmd, { live: true })
  return success
}


function eslintDirs(dirs) {
  let anyErrors = false

  for (let dir of dirs) {
    if (!eslintDir(dir)) {
      anyErrors = true
    }
  }

  return !anyErrors
}


function eslintAll() {
  return eslintDirs(getAllDirs())
}


function getAllDirs() {
  return packageStructs.concat(testStructs).map((struct) => struct.dir)
}


if (require.main === module) {
  let dirs = process.argv.splice(2)
  let success

  if (!dirs.length || dirs[0] === 'all') {
    success = eslintAll()
  } else {
    success = eslintDirs(dirs)
  }

  if (!success) {
    process.exit(1)
  }
}
