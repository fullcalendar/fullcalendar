const path = require('path')
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
let projMeta = require(path.join(projDir, 'package.json'))
let depNames = Object.keys({ ...projMeta.dependencies, ...projMeta.devDependencies })
let pkgNameToLocationHash = workspaceUtil.getPkgNameToLocationHash()

exec.sync(
  'npm install',
  { cwd: projDir, exitOnError: true, live: true }
)

for (let depName of depNames) {
  let depLocation = pkgNameToLocationHash[depName]

  if (depLocation) {
    let linkPath = path.join('node_modules', depName)

    exec.sync(
      [ 'rm', '-rf', linkPath ],
      { cwd: projDir, exitOnError: true }
    )
    exec.sync(
      [ 'mkdir', '-p', path.dirname(linkPath) ],
      { cwd: projDir, exitOnError: true }
    )
    exec.sync(
      [ 'ln', '-s', path.join(rootDir, depLocation), linkPath ],
      { cwd: projDir, exitOnError: true }
    )
  }
}

if (runCmd) {
  exec.sync(
    [ 'npm', 'run', runCmd ],
    { cwd: projDir, exitOnError: true, live: true, env: {
      ...process.env,
      NODE_OPTIONS: '', // prevent yarn from injecting pnp script
      NODE_PRESERVE_SYMLINKS: '1'
    } }
  )
}
