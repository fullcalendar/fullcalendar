const path = require('path')
const exec = require('./lib/shell')
const globby = require('globby')

let rootDir = path.resolve(__dirname, '..')
let examplesDir = path.join(rootDir, 'example-projects')
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
  globby.sync('*', { cwd: examplesDir, onlyDirectories: true }) :
  [ givenProjName ]

for (let projName of projNames) {
  let projDir = path.join(examplesDir, projName)

  console.log('')
  console.log('PROJECT:', projName)
  console.log(projDir)

  switch(projName) {

    case 'next': // somehow incompatible with babel-plugin-transform-require-ignore. REVISIT
    case 'nuxt': // nuxt cli tool uses webpack 4
    case 'vue-typescript': // vue cli tool uses webpack 4
    case 'vue-vuex': // vue cli tool uses webpack 4
    case 'parcel': // doesn't support pnp yet. parcel 2 WILL
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
