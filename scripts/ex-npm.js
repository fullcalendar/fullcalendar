const path = require('path')
const globby = require('globby')
const exec = require('./lib/shell')
const workspaceUtil = require('./lib/workspace-util')

let rootDir = path.resolve(__dirname, '..')
let exDir = path.join(rootDir, 'example-projects')
let projName = process.argv[2]
let runCmd = process.argv[3]

if (!projName) {
  console.error('Must specify an example-project name')
  process.exit(1)
}

let projDir = path.join(exDir, projName)
let fcPkgRootDir = path.join(projDir, 'node_modules', '@fullcalendar')

function resetFcPkgs(pkgNameToLocationHash) {
  let fcPkgShortNames = globby.sync('*', { cwd: fcPkgRootDir, onlyFiles: false })

  for (let fcPkgShortName of fcPkgShortNames) {
    exec.sync(
      [ 'rm', '-rf', fcPkgShortName ],
      { cwd: fcPkgRootDir, exitOnError: true }
    )

    if (pkgNameToLocationHash) {
      let fcPkgName = `@fullcalendar/${fcPkgShortName}`
      let fcPkgLocation = pkgNameToLocationHash[fcPkgName]

      if (!fcPkgLocation) {
        throw new Error(`Could not find location for package ${fcPkgName}`)
      }

      exec.sync(
        [ 'cp', '-r', path.join(rootDir, fcPkgLocation), fcPkgShortName ],
        { cwd: fcPkgRootDir, exitOnError: true }
      )
    }
  }
}

resetFcPkgs() // deletes all @fullcalendar/* packages

exec.sync(
  'npm install',
  { cwd: projDir, exitOnError: true, live: true, env: {
    ...process.env,
    NODE_OPTIONS: '' // prevent yarn from injecting pnp script
  } }
)

resetFcPkgs(workspaceUtil.getPkgNameToLocationHash())

if (runCmd) {
  exec.sync(
    [ 'npm', 'run', runCmd ],
    { cwd: projDir, exitOnError: true, live: true, env: {
      ...process.env,
      NODE_OPTIONS: '' // prevent yarn from injecting pnp script
    } }
  )
}
