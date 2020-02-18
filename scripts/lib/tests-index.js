#!/usr/bin/env node

const path = require('path')
const { exec, execSync } = require('child_process')
const { writeFile } = require('./util')
const glob = require('glob')
const chokidar = require('chokidar')

// let cmdArgs = process.argv.slice(2)
// let isWatching = cmdArgs.indexOf('--watch') !== -1
let tmpDir = path.join(__dirname, '../../tmp')


exports.buildTestIndex = (watch) => {
  return _buildTestIndex().then(() => watch && watchChanges())
}


function watchChanges() {
  let dirs = glob.sync('tsc-output/packages*/__tests__/src', { cwd: tmpDir })
  console.log('[test-index] Watching for changes...', dirs)

  let watcher = chokidar.watch(dirs, {
    cwd: tmpDir,
    ignoreInitial: true
  })

  watcher.on('all', (event, path) => { // TODO: debounce?
    if (path.match(/\.js$/)) {
      _buildTestIndex()
    }
  })

  process.on('SIGINT', function() {
    console.log('[test-index] No longer watching for changes.')
    watcher.close()
  })
}


function _buildTestIndex() {
  return new Promise((resolve, reject) => {
    exec(
      'find tsc-output/packages*/__tests__/src -mindepth 2 -name \'*.js\' -print0 | ' +
      'xargs -0 grep -E "(fdescribe|fit)\\("',
      {
        cwd: tmpDir,
        encoding: 'utf8'
      },
      function(error, stdout, stderr) {
        let files

        if (error && stderr) { // means there was a real error
          reject(new Error(stderr))

        } else {

          if (error) { // means there were no files that matched

            let findOutput = execSync('find tsc-output/packages*/__tests__/src -mindepth 2 -name \'*.js\'', {
              cwd: tmpDir,
              encoding: 'utf8'
            })
            findOutput = findOutput.trim()
            files = !findOutput ? [] : findOutput.split('\n')
            files = uniqStrs(files)
            console.log(`[test-index] Compiling all ${files.length} test files.`)

          } else {
            stdout = stdout.trim()
            let lines = !stdout ? [] : stdout.split('\n')
            files = lines.map((line) => line.trim().split(':')[0])
            files = uniqStrs(files)
            console.log(
              '[test-index] Compiling only test files that have fdescribe/fit:\n' +
              files.map((file) => ` - ${file}`).join('\n')
            )
          }

          let mainFiles = glob.sync('tsc-output/packages*/__tests__/src/main.js', {
            cwd: tmpDir
          })

          files = mainFiles.concat(files)

          let code =
            files.map(
              (file) => `import ${JSON.stringify('./' + file)}`
            ).join('\n') +
            '\n'

          writeFile(
            path.join(tmpDir, 'tests-index.js'),
            code
          ).then(resolve)
        }
      }
    )
  })
}


function uniqStrs(a) {
  let hash = {}
  for (let item of a) {
    hash[item] = true
  }
  return Object.keys(hash)
}
