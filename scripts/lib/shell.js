
const { spawn, spawnSync, exec, execFile } = require('child_process')
const { promisify } = require('util')


function betterExec(cmd, options = {}, callback) {
  let childProcess
  let cmdStr, cmdPath, cmdArgs

  if (Array.isArray(cmd)) {
    cmdPath = cmd[0]
    cmdArgs = cmd.slice(1)
  } else {
    cmdStr = cmd
  }

  function callbackWrap(error, res) {
    if (callback) {
      callback(error, res)
    }

    if (error && options.exitOnError) {
      process.exit(1) // TODO: somehow get exit code
    }
  }

  if (options.live) {
    childProcess = spawn(cmdPath || cmdStr, cmdArgs, {
      shell: !cmdArgs,
      stdio: 'inherit',
      ...options
    })
    childProcess.on('close', function(code) {
      callbackWrap(
        code === 0 ? null : new Error('shell command failed'),
        { success: code === 0 }
      )
    })

  } else if (cmdArgs) { // array of tokens
    childProcess = execFile(cmdPath, cmdArgs, {
      encoding: 'utf8',
      ...options
    }, function(error, stdout, stderr) {
      callbackWrap(error, { stdout, stderr, success: !error })
    })

  } else { // exec in a shell
    childProcess = exec(cmdStr, {
      encoding: 'utf8',
      ...options
    }, function(error, stdout, stderr) {
      callbackWrap(error, { stdout, stderr, success: !error })
    })
  }

  return childProcess
}


function betterExecSync(cmd, options = {}) {
  let cmdStr, cmdPath, cmdArgs

  if (Array.isArray(cmd)) {
    cmdPath = cmd[0]
    cmdArgs = cmd.slice(1)
  } else {
    cmdStr = cmd
  }

  let res = spawnSync(cmdPath || cmdStr, cmdArgs, {
    encoding: 'utf8',
    shell: !cmdArgs,
    stdio: options.live ? 'inherit' : 'pipe',
    ...options
  })

  if (res.status !== 0 && options.exitOnError) {
    process.exit(res.status)
  }

  return { ...res, success: res.status === 0 }
}


function withOptions(baseOptions = {}) {
  let origFunc = this

  return (cmd, options) => {
    return origFunc(cmd, { ...baseOptions, ...options })
  }
}


betterExec.withOptions = withOptions
betterExec.sync = betterExecSync
betterExec.sync.withOptions = withOptions
betterExec.promise = promisify(betterExec)
betterExec.promise.withOptions = withOptions

module.exports = betterExec


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
