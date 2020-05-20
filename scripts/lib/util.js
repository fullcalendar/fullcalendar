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

exports.watch = betterWatch
exports.watchTask = watchTask
exports.shellTask = shellTask
exports.promisifyVinyl = promisifyVinyl
exports.readFile = betterReadFile
exports.readFileSync = betterReadFileSync
exports.writeFile = betterWriteFile
exports.writeFileSync = betterWriteFileSync
exports.copyFile = betterCopyFile
exports.fileExists = fileExists
exports.mkdirp = mkdirp


function betterWatch() { // i cant believe gulp doesnt do this
  let watcher = watch.apply(null, arguments)

  return new Promise((resolve) => {
    process.on('SIGINT', function() {
      watcher.close()
      resolve()
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


function betterReadFileSync(destPath) {
  return fs.readFileSync(destPath, { encoding: 'utf8' })
}


function betterWriteFile(destPath, content) {
  return mkdirp(path.dirname(destPath)).then(function() {
    return writeFile(destPath, content, { encoding: 'utf8' })
  })
}


function betterWriteFileSync(destPath, content) {
  mkdirp.sync(path.dirname(destPath))
  return fs.writeFileSync(destPath, content, { encoding: 'utf8' })
}


function betterCopyFile(srcPath, destPath) {
  return mkdirp(path.dirname(destPath)).then(function() {
    return copyFile(srcPath, destPath)
  })
}



exports.mapHash = function(input, func) {
  const output = {}

  for (const key in input) {
    if (hasOwnProperty.call(input, key)) {
      output[key] = func(input[key], key)
    }
  }

  return output
}

exports.mapHashViaPair = function(input, func) {
  const output = {}

  for (const key in input) {
    if (hasOwnProperty.call(input, key)) {
       let pair = func(input[key], key)
       output[pair[0]] = pair[1]
    }
  }

  return output
}

exports.arrayToHash = function(a, func) {
  let output = {}

  for (let i = 0; i < a.length; i++) {
    let pair = func(a[i], i)
    output[pair[0]] = pair[1]
  }

  return output
}
