const path = require('path')
const exec = require('./lib/shell')
const globby = require('globby')

const rootDir = path.resolve(__dirname, '..')
const examplesDir = path.join(rootDir, 'example-projects')
const givenProjName = process.argv[2]
const runCmd = process.argv[3]

///////////////////////////////////////////////////////
// Project Settings
const disabledProjects = {
  next: 'This example is disabled till the next major release',
  'next-scheduler': 'This example is disabled till the next major release',
  parcel: 'This example is being transitioned to a newer version',
  'parcel-2':
    'There is currently a bug in parcel which prevents this from working',
    // https://github.com/parcel-bundler/parcel/issues/4729
    // tries to load babel within each fc file and fails
}
const pnpSimulatedProjects = {
  angular: 'Angular CLI does not support Yarn PnP',
}
///////////////////////////////////////////////////////

if (!givenProjName) {
  console.error('Must specify an example-project name, or "all"')
  process.exit(1)
}

if (!runCmd) {
  console.error('Must specify a run command')
  process.exit(1)
}

const projNames =
  givenProjName === 'all'
    ? globby.sync('*', { cwd: examplesDir, onlyDirectories: true })
    : [givenProjName]

projNames.forEach((projName) => {
  // Don't run disabled projects
  if (disabledProjects.hasOwnProperty(projName)) {
    console.info(disabledProjects[projName])
    return
  }

  const projDir = path.join(examplesDir, projName)

  console.log()
  console.info('PROJECT:', projName)
  console.log(projDir)

  // Decide whether to simulate pnp or run normal yarn
  if (pnpSimulatedProjects.hasOwnProperty(projName)) {
    console.log('Using PnP simulation')
    console.log()
    exec.sync(['yarn', 'run', 'example:pnp', projName, runCmd], {
      cwd: rootDir,
      exitOnError: true,
      live: true,
    })
  } else {
    console.log('Normal Yarn execution')
    console.log()
    exec.sync(['yarn', 'run', runCmd], {
      cwd: projDir,
      exitOnError: true,
      live: true,
    })
  }
  console.log()
})
