const util = require('util')
const path = require('path')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const copyFile = util.promisify(fs.copyFile)
const mkdirp = util.promisify(require('mkdirp'))
const concurrently = require('concurrently')


exports.shellTask = shellTask
exports.promisifyVinyl = promisifyVinyl
exports.readFile = betterReadFile
exports.writeFile = betterWriteFile
exports.writeFileSync = betterWriteFileSync
exports.copyFile = betterCopyFile


function shellTask(...tasks) {
  let func = function() {
    return concurrently(tasks) // good for labeling each line of output
  }
  func.displayName = tasks.join(' ')
  return func
}


/*
turns a vinyl stream object into a promise
*/
function promisifyVinyl(vinyl) {
  return new Promise(function(resolve, reject) {
    vinyl.on('end', resolve) // TODO: handle error?
  })
}


function betterReadFile(destPath, content) {
  return readFile(destPath, { encoding: 'utf8' })
}


function betterWriteFile(destPath, content) {
  return mkdirp(path.dirname(destPath)).then(function() {
    return writeFile(destPath, content, { encoding: 'utf8' })
  })
}


function betterWriteFileSync(destPath, content) {
  mkdirp.sync(path.dirname(destPath))
  writeFile(destPath, content, { encoding: 'utf8' })
}


function betterCopyFile(srcPath, destPath) {
  return mkdirp(path.dirname(destPath)).then(function() {
    return copyFile(srcPath, destPath)
  })
}
