const path = require('path')
const exec = require('./lib/shell')
const globby = require('globby')

let rootDir = path.resolve(__dirname, '..')
let contribRootDir = path.join(rootDir, 'packages-contrib')
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
  globby.sync('*', { cwd: contribRootDir, onlyDirectories: true }) :
  [ givenProjName ]

for (let projName of projNames) {
  let projDir = path.join(contribRootDir, projName)

  console.log('')
  console.log('PROJECT:', projName)
  console.log(projDir)

  switch(projName) {

    case 'angular':
      console.log('Using PnP simulation')
      console.log('')
      exec.sync(
        [ 'yarn', 'pnpify', '--cwd', projName, 'yarn', 'run', runCmd ],
        { cwd: contribRootDir, exitOnError: true, live: true }
      )
      break

    default:
      console.log('Normal Yarn execution')
      console.log('')
      exec.sync(
        [ 'yarn', 'run', runCmd ],
        { cwd: projDir, exitOnError: true, live: true }
      )
      break
  }
}
