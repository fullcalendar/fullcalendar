const path = require('path')
const exec = require('./lib/shell')
const globby = require('globby')

const rootDir = path.resolve(__dirname, '..')
const examplesDir = path.join(rootDir, 'example-projects')
const givenProjName = process.argv[2]

///////////////////////////////////////////////////////
// Project Settings
const specialMatchers = {
  next: 'pages/',
  'next-scheduler': 'pages/',
  nuxt: 'pages/ ',
}
///////////////////////////////////////////////////////

const hasLinting = (projDir) => {
  const packageJSON = require(`${projDir}/package.json`)
  return packageJSON.scripts && packageJSON.scripts.lint
}

const projNames =
  givenProjName && givenProjName !== 'all'
    ? [givenProjName]
    : globby.sync('*', { cwd: examplesDir, onlyDirectories: true })

projNames.forEach((projName) => {
  const projDir = path.join(examplesDir, projName)

  console.log()
  console.info('PROJECT:', projName)
  console.log(projDir)

  if (hasLinting(projDir)) {
    exec.sync(['yarn', 'run', 'lint'], {
      cwd: projDir,
      exitOnError: false,
      live: true,
    })
  } else {
    const pattern = specialMatchers[projName] || 'src/'

    // Prettier is currently not part of any workspace, I will defer on adding it as a dependency
    // exec.sync(["yarn", "exec", "prettier", "--write", "./src"], {
    //   cwd: projDir,
    //   exitOnError: false,
    //   live: true,
    // });

    exec.sync(
      `yarn exec eslint ${pattern} --fix-dry-run --config ../.eslintrc.json --ext .tsx,.ts,.jsx,.js`,
      {
        cwd: projDir,
        exitOnError: false,
        live: true,
      }
    )
  }

  console.log()
})
