const path = require('path')
const exec = require('./lib/shell')
const globby = require('globby')

let rootDir = path.resolve(__dirname, '..')
let exDir = path.join(rootDir, 'example-projects')
let projNames = process.argv.slice(2)

if (!projNames.length) {
  projNames = globby.sync('*', { cwd: exDir, onlyDirectories: true })
}

for (let projName of projNames) {
  let projDir = path.join(exDir, projName)

  console.log('')
  console.log('PROJECT:', projName)
  console.log(projDir)

  switch(projName) {

    case 'next':
    case 'nuxt':
    case 'vue-typescript':
    case 'vue-vuex':
    case 'parcel':
      console.log('Using NPM simulation')
      console.log()
      exec.sync(
        [ 'yarn', 'run', 'ex:npm', projName, 'build' ],
        { cwd: rootDir, exitOnError: true, live: true }
      )
      break

    case 'angular':
      console.log('Using PnP simulation')
      console.log()
      exec.sync(
        [ 'yarn', 'run', 'ex:pnp', projName, 'build' ],
        { cwd: rootDir, exitOnError: true, live: true }
      )
      break

    default:
      console.log('Normal Yarn execution')
      console.log()
      exec.sync(
        [ 'yarn', 'run', 'build' ],
        { cwd: projDir, exitOnError: true, live: true }
      )
      break
  }

  console.log('')
}
