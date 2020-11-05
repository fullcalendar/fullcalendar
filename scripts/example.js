const path = require('path')
const exec = require('./lib/shell')
const globby = require('globby')

let rootDir = path.resolve(__dirname, '..')
let exDir = path.join(rootDir, 'example-projects')
let givenProjName = process.argv[2]
let runCmd = process.argv[3]

if (!givenProjName) {
  console.error('Must specify an example-project name, or "all"')
  process.exit(1)
}

if (!runCmd) {
  console.error('Must specify a run command')
  process.exit(1)
}

let projNames = givenProjName === 'all' ?
  globby.sync('*', { cwd: exDir, onlyDirectories: true }) :
  [ givenProjName ]

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
        [ 'yarn', 'run', 'example:npm', projName, runCmd ],
        { cwd: rootDir, exitOnError: true, live: true }
      )
      break

    case 'angular':
      console.log('Using PnP simulation')
      console.log()
      exec.sync(
        [ 'yarn', 'run', 'example:pnp', projName, runCmd ],
        { cwd: rootDir, exitOnError: true, live: true }
      )
      break

    default:
      console.log('Normal Yarn execution')
      console.log()
      exec.sync(
        [ 'yarn', 'run', runCmd ],
        { cwd: projDir, exitOnError: true, live: true }
      )
      break
  }

  console.log('')
}
