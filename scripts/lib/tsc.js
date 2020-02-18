#!/usr/bin/env node

const { spawn } = require('child_process')


exports.runTscWatch = () => {
  return new Promise((resolve, reject) => {
    let subprocess = spawn('npm run tsc:watch', [], {
      shell: true, // above command is executed in bash
      stdio: [ 'ignore', 'pipe', 2 ] // ignore input, collect stdout, passthru stderr
    })
    subprocess.stdout.on('data', (data) => {
      let s = data.toString()
      process.stdout.write(s) // no newline
      if (s.match(/watching/i)) { // find string "Watching for file changes"
        resolve()
      }
    })
    subprocess.on('close', (code) => {
      if (code !== 0) {
        reject() // tsc closed with an error, most likely on startup
      } else {
        resolve() // if for some reason "watching" message wasn't caught
      }
    })
  })
}


exports.runTsc = () => {
  return new Promise((resolve, reject) => {
    let subprocess = spawn('npm run tsc', [], {
      shell: true, // above command is executed in bash
      stdio: [ 'ignore', 1, 2 ] // ignore input, passthru stdout, passthru stderr
    })
    subprocess.on('close', (code) => {
      if (code !== 0) {
        reject() // tsc closed with an error, most likely on startup
      } else {
        resolve() // if for some reason "watching" message wasn't caught
      }
    })
  })
}
