
const { spawn, spawnSync, exec, execFile } = require('child_process')


function betterExec(cmd, args, options = {}, callback) {
  let childProcess

  if (options.live) {
    childProcess = spawn(cmd, args, {
      shell: args == null,
      stdio: 'inherit',
      ...options
    })
    childProcess.on('close', function(code) {
      callback(null, { success: code === 0 })
    })

  } else if (args == null) { // exec in a shell
    childProcess = exec(cmd, {
      encoding: 'utf8',
      ...options
    }, function(error, stdout, stderr) {
      callback(error, { stdout, stderr, success: !error })
    })

  } else {
    childProcess = execFile(cmd, args, {
      encoding: 'utf8',
      ...options
    }, function(error, stdout, stderr) {
      callback(error, { stdout, stderr, success: !error })
    })
  }

  return childProcess
}


function betterExecSync(cmd, args, options = {}) {
  let res = spawnSync(cmd, args, {
    encoding: 'utf8',
    shell: args == null,
    stdio: options.live ? 'inherit' : 'pipe',
    ...options
  })

  return { ...res, success: res.status === 0 }
}


betterExec.sync = betterExecSync
exports.exec = betterExec


/* parsing workspaces

const PROJECT_ROOT = path.resolve(__dirname, '..')

let res = exec('yarn', [ 'workspaces', '--json', 'info' ], { // order of args matters
  cwd: PROJECT_ROOT
})

if (!res.success) {
  console.error(res.stderr)
  process.exit(1)

} else {
  let workspaces

  try {
    let wrapper = JSON.parse(res.stdout)
    workspaces = JSON.parse(wrapper.data)
  } catch(err) {
    console.error('Couldn\'t parse JSON')
    process.exit(1)
  }

  console.log(workspaces)
}

*/
