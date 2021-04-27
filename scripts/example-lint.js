const path = require('path')
const exec = require('./lib/shell')
const globby = require('globby')

const rootDir = path.resolve(__dirname, '..')
const examplesDir = path.join(rootDir, 'example-projects')
const givenProjName = process.argv[2] || 'all'

const projNames =
  givenProjName === 'all'
    ? globby.sync('*', { cwd: examplesDir, onlyDirectories: true })
    : [givenProjName]

projNames.forEach((projName) => {
  const projDir = path.join(examplesDir, projName)

  console.log()
  console.info('PROJECT:', projName)
  console.log(projDir)

  const { success } = exec.sync(['yarn', 'run', 'lint'], {
    cwd: projDir,
    exitOnError: false,
    live: true,
  })

  if (!success) {
    console.log('Could not execute lint script, attempting generic linting')

    // Prettier is currently not part of any workspace, I will defer on adding it as a dependency
    // exec.sync(["yarn", "run", "prettier", "--write", "./src"], {
    //   cwd: projDir,
    //   exitOnError: false,
    //   live: true,
    // });

    exec.sync(
      'yarn exec eslint src/ --fix-dry-run --config ../.eslintrc.json --ext .tsx,.ts,.jsx,.js',
      {
        cwd: projDir,
        exitOnError: false,
        live: true,
      }
    )
  }

  console.log()
})
