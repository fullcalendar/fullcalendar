const path = require('path')
const exec = require('./lib/shell')

let rootDir = path.resolve(__dirname, '..')
let exDir = path.join(rootDir, 'example-projects')
let projName = process.argv[2]
let runCmd = process.argv[3]

if (!projName) {
  console.error('Must specify an example-project name')
  process.exit(1)
}

if (!runCmd) {
  console.error('Must specify an run-script argument')
  process.exit(1)
}

exec.sync(
  [ 'yarn', 'pnpify', '--cwd', projName, 'yarn', 'run', runCmd ],
  { cwd: exDir, exitOnError: true, live: true }
)
