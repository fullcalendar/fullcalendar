const util = require('util')
const path = require('path')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const copyFile = util.promisify(fs.copyFile)
const fileExists = util.promisify(fs.exists)
const mkdirp = util.promisify(require('mkdirp'))
const concurrently = require('concurrently')
const { watch } = require('gulp')

exports.whenFirstModified = whenFirstModified
exports.watch = betterWatch
exports.watchTask = watchTask
exports.shellTask = shellTask
exports.promisifyVinyl = promisifyVinyl
exports.readFile = betterReadFile
exports.writeFile = betterWriteFile
exports.writeFileSync = betterWriteFileSync
exports.copyFile = betterCopyFile
exports.fileExists = fileExists
exports.mkdirp = mkdirp


function betterWatch() {
  let watcher = watch.apply(null, arguments)

  return new Promise((resolve) => {
    process.on('SIGINT', function() {
      watcher.close()
      resolve()
    })
  })
}


// function firstModifiedTask() { // TODO: general taskify (with description?)
//   let args = arguments
//   return function() {
//     return whenFirstModified.apply(null, args) // can just use bind?
//   }
// }


function whenFirstModified(glob, options) {
  return new Promise((resolve) => {
    let watcher = watch(glob, options || {}, function(cb) {
      watcher.close()
      resolve()
      cb()
    })
  })
}


function watchTask() { // TODO: use in more places
  let watchArgs = arguments

  return function() {
    return betterWatch.apply(null, watchArgs)
  }
}


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


function betterReadFile(destPath) {
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
